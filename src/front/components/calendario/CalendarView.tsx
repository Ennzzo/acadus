"use client";

import { useState, useEffect } from "react";
import { Evento } from "@/types/evento";
import { MembroEquipe } from "@/types/equipe";
import { Tarefa } from "@/types/tarefa";
import { apiFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import EventFormModal from "./EventFormModal";
import EventViewModal from "./EventViewModal";
import EventEditModal from "./EventEditModal";
import EventDeleteConfirmModal from "./EventDeleteConfirmModal";
import styles from "./CalendarView.module.css";

type ModalState =
  | { type: "none" }
  | { type: "create"; dataPre?: string }
  | { type: "view"; evento: Evento }
  | { type: "edit"; evento: Evento };

interface EventoResponse {
  id: number;
  nome: string;
  descricao?: string | null;
  data: string;
  projetoId?: number | null;
  equipeId?: number | null;
  responsavelId?: number | null;
  cor?: string | null;
  membrosIds: number[];
}

interface CalendarViewProps {
  projetoId?: number;
  isLeader?: boolean;
}

const COR_TAREFA = "#64748b";
const COR_EVENTO_PADRAO = "#2563eb";

function normalizarDataEvento(data: string) {
  return data.includes("T") ? data.split("T")[0] : data;
}

function removerEventosDuplicados(eventos: Evento[]) {
  return Array.from(new Map(eventos.map((evento) => [`${evento.tipo ?? "evento"}-${evento.id}`, evento])).values());
}

function deduplicarMembros(membros: MembroEquipe[]) {
  return Array.from(new Map(membros.map((membro) => [membro.email.toLowerCase(), membro])).values());
}

function tarefaParaEvento(tarefa: Tarefa): Evento | null {
  if (!tarefa.prazo || tarefa.excluida) return null;

  return {
    id: tarefa.id,
    nome: tarefa.nome,
    descricao: tarefa.descricao,
    data: tarefa.prazo,
    cor: COR_TAREFA,
    tipo: "tarefa",
    projetoId: tarefa.projetoId,
    membros: [],
  };
}

export default function CalendarView({
  projetoId = 1,
  isLeader = false,
}: CalendarViewProps) {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [eventoParaExcluir, setEventoParaExcluir] = useState<Evento | null>(null);
  const [membrosMap, setMembrosMap] = useState<Record<number, MembroEquipe>>({});
  const [membros, setMembros] = useState<MembroEquipe[]>([]);

  // Load project members
  useEffect(() => {
    async function carregarMembros() {
      if (!projetoId) return;
      try {
        const data = await apiFetch<MembroEquipe[]>(`/projetos/${projetoId}/membros`, {
          cache: "no-store",
        });
        const membrosUnicos = deduplicarMembros(data);
        const map: Record<number, MembroEquipe> = {};
        membrosUnicos.forEach((m) => {
          if (m.id) map[m.id] = m;
        });
        setMembros(membrosUnicos);
        setMembrosMap(map);
      } catch {
        // Silently fail - membrosMap stays empty
        setMembros([]);
      }
    }
    carregarMembros();
  }, [projetoId]);

  // Load events from backend on mount and when mes/ano/projetoId changes
  useEffect(() => {
    async function carregarEventos() {
      try {
        setLoading(true);
        const url = projetoId
          ? `/api/eventos/projeto/${projetoId}/mes/${ano}/${mes + 1}`
          : `/api/eventos/mes/${ano}/${mes + 1}`;
        
        const [data, tarefas] = await Promise.all([
          apiFetch<EventoResponse[]>(url, { cache: "no-store" }),
          projetoId
            ? apiFetch<Tarefa[]>(`/projetos/${projetoId}/tarefas`, { cache: "no-store" })
            : Promise.resolve([]),
        ]);
        
        // Convert backend response to frontend Evento format
        const eventosFormatados = data.map((e) => ({
          id: e.id,
          nome: e.nome,
          descricao: e.descricao,
          data: normalizarDataEvento(e.data),
          cor: e.cor || COR_EVENTO_PADRAO,
          tipo: "evento" as const,
          projetoId: e.projetoId,
          equipeId: e.equipeId,
          responsavelId: e.responsavelId,
          membros: (e.membrosIds || []).map((id: number) => ({ id })),
        }));
        const tarefasFormatadas = tarefas
          .map(tarefaParaEvento)
          .filter((evento): evento is Evento => Boolean(evento));
        setEventos(removerEventosDuplicados([...eventosFormatados, ...tarefasFormatadas]));
      } catch {
        toast.error("Erro ao carregar eventos");
        setEventos([]);
      } finally {
        setLoading(false);
      }
    }
    carregarEventos();
  }, [mes, ano, projetoId]);

  function irMesAnterior() {
    if (mes === 0) {
      setMes(11);
      setAno((a) => a - 1);
    } else {
      setMes((m) => m - 1);
    }
  }

  function irProximoMes() {
    if (mes === 11) {
      setMes(0);
      setAno((a) => a + 1);
    } else {
      setMes((m) => m + 1);
    }
  }

  // Filter events for current month  
  const eventosMes = eventos.filter((e) => {
    const d = new Date(e.data + "T00:00:00");
    return d.getFullYear() === ano && d.getMonth() === mes;
  });

  function handleCriarEvento(dados: {
    nome: string;
    data: string;
    descricao: string;
    cor: string;
    membrosIds: number[];
  }) {
    (async () => {
      try {
        const payload = {
          nome: dados.nome,
          data: dados.data,
          descricao: dados.descricao || null,
          cor: dados.cor,
          projetoId: projetoId || null,
          equipeId: null,
          responsavelId: null,
          membrosIds: dados.membrosIds,
        };
        const novo = await apiFetch<EventoResponse>("/api/eventos", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setEventos((prev) =>
          removerEventosDuplicados([
            ...prev,
            {
              id: novo.id,
              nome: novo.nome,
              data: normalizarDataEvento(novo.data),
              descricao: novo.descricao,
              cor: novo.cor || dados.cor,
              tipo: "evento",
              projetoId: novo.projetoId,
              equipeId: novo.equipeId,
              responsavelId: novo.responsavelId,
              membros: (novo.membrosIds || []).map((id: number) => ({ id })),
            },
          ])
        );
        toast.success("Evento criado com sucesso!");
        setModal({ type: "none" });
      } catch {
        toast.error("Erro ao criar evento");
      }
    })();
  }

  function handleEditarEvento(dados: {
    id: number;
    nome: string;
    data: string;
    descricao: string;
    cor: string;
    membrosIds: number[];
  }) {
    (async () => {
      try {
        const payload = {
          nome: dados.nome,
          data: dados.data,
          descricao: dados.descricao || null,
          cor: dados.cor,
          projetoId: projetoId || null,
          equipeId: null,
          responsavelId: null,
          membrosIds: dados.membrosIds,
        };
        await apiFetch<void>(`/api/eventos/${dados.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setEventos((prev) =>
          prev.map((e) =>
            e.id === dados.id
              ? {
                  ...e,
                  nome: dados.nome,
                  data: dados.data,
                  descricao: dados.descricao,
                  cor: dados.cor,
                  membros: (dados.membrosIds || []).map((id: number) => ({ id })),
                }
              : e
          )
        );
        toast.success("Evento atualizado com sucesso!");
        setModal({ type: "none" });
      } catch {
        toast.error("Erro ao editar evento");
      }
    })();
  }

  async function handleExcluirEvento(id: number) {
    try {
      await apiFetch<void>(`/api/eventos/${id}`, {
        method: "DELETE",
      });
      setEventos((prev) => prev.filter((e) => e.id !== id));
      toast.success("Evento excluído com sucesso!");
      setEventoParaExcluir(null);
      setModal({ type: "none" });
    } catch {
      toast.error("Erro ao excluir evento");
      throw new Error("Não foi possível excluir o evento.");
    }
  }

  function coresUsadasNoDia(data?: string) {
    if (!data) return [];
    return eventos
      .filter((evento) => evento.tipo !== "tarefa" && evento.data === data && evento.cor)
      .map((evento) => evento.cor as string);
  }

  function handleDayClick(data: string) {
    if (!isLeader) return; // Apenas líderes podem criar eventos
    setModal({ type: "create", dataPre: data });
  }

  return (
    <div className={styles.container}>
      <CalendarHeader
        mes={mes}
        ano={ano}
        isLeader={isLeader}
        onPrev={irMesAnterior}
        onNext={irProximoMes}
        onAddEvento={() => setModal({ type: "create" })}
      />
      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>Carregando eventos...</p>
        </div>
      ) : (
        <CalendarGrid
          mes={mes}
          ano={ano}
          eventos={eventosMes}
          onEventoClick={(evento) => setModal({ type: "view", evento })}
          onDayClick={handleDayClick}
        />
      )}

      {/* Modais */}
      {modal.type === "create" && (
        <EventFormModal
          projetoId={projetoId}
          dataPre={modal.dataPre}
          membros={membros}
          coresUsadasPorData={coresUsadasNoDia}
          onClose={() => setModal({ type: "none" })}
          onSave={handleCriarEvento}
        />
      )}

      {modal.type === "view" && (
        <EventViewModal
          evento={modal.evento}
          membrosInfo={modal.evento.membros
            .map((m) => ({
              id: m.id,
              nome: membrosMap[m.id]?.nome ?? undefined,
              sobrenome: membrosMap[m.id]?.sobrenome ?? undefined,
              email: membrosMap[m.id]?.email,
            }))
            .filter((m) => m.nome || m.email)} // Filter valid members
          onClose={() => setModal({ type: "none" })}
          onEdit={() => setModal({ type: "edit", evento: modal.evento })}
          onDelete={() => setEventoParaExcluir(modal.evento)}
          canEdit={isLeader && modal.evento.tipo !== "tarefa"}
          readonlyReason={modal.evento.tipo === "tarefa" ? "Este item é uma tarefa. Edite ou exclua pela tela de tarefas." : undefined}
        />
      )}

      {modal.type === "edit" && (
        <EventEditModal
          evento={modal.evento}
          membros={membros}
          onClose={() => setModal({ type: "none" })}
          onSave={handleEditarEvento}
          onDelete={() => setEventoParaExcluir(modal.evento)}
        />
      )}

      {eventoParaExcluir && (
        <EventDeleteConfirmModal
          evento={eventoParaExcluir}
          onClose={() => setEventoParaExcluir(null)}
          onConfirm={() => handleExcluirEvento(eventoParaExcluir.id)}
        />
      )}
    </div>
  );
}

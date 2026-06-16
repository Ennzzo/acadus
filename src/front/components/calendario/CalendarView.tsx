"use client";

import { useState, useEffect } from "react";
import { Evento } from "@/types/evento";
import { MembroEquipe } from "@/types/equipe";
import { apiFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import EventFormModal from "./EventFormModal";
import EventViewModal from "./EventViewModal";
import EventEditModal from "./EventEditModal";
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
  membrosIds: number[];
}

interface CalendarViewProps {
  projetoId?: number;
  isLeader?: boolean;
  responsaveisMap?: Record<number, string>;
}

export default function CalendarView({
  projetoId = 1,
  isLeader = false,
  responsaveisMap = {},
}: CalendarViewProps) {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [membrosMap, setMembrosMap] = useState<Record<number, MembroEquipe>>({});

  // Load project members
  useEffect(() => {
    async function carregarMembros() {
      if (!projetoId) return;
      try {
        const data = await apiFetch<MembroEquipe[]>(`/projetos/${projetoId}/membros`, {
          cache: "no-store",
        });
        const map: Record<number, MembroEquipe> = {};
        data.forEach((m) => {
          if (m.id) map[m.id] = m;
        });
        setMembrosMap(map);
      } catch {
        // Silently fail - membrosMap stays empty
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
        
        const data = await apiFetch<EventoResponse[]>(url, { cache: "no-store" });
        
        // Convert backend response to frontend Evento format
        const eventosFormatados = data.map((e) => ({
          id: e.id,
          nome: e.nome,
          descricao: e.descricao,
          data: e.data,
          projetoId: e.projetoId,
          equipeId: e.equipeId,
          responsavelId: e.responsavelId,
          membros: (e.membrosIds || []).map((id: number) => ({ id })),
        }));
        setEventos(eventosFormatados);
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
    membrosIds: number[];
  }) {
    (async () => {
      try {
        const payload = {
          nome: dados.nome,
          data: dados.data,
          descricao: dados.descricao || null,
          projetoId: projetoId || null,
          equipeId: null,
          responsavelId: null,
          membrosIds: dados.membrosIds,
        };
        const novo = await apiFetch<EventoResponse>("/api/eventos", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setEventos((prev) => [
          ...prev,
          {
            id: novo.id,
            nome: novo.nome,
            data: novo.data,
            descricao: novo.descricao,
            projetoId: novo.projetoId,
            equipeId: novo.equipeId,
            responsavelId: novo.responsavelId,
            membros: (novo.membrosIds || []).map((id: number) => ({ id })),
          },
        ]);
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
    membrosIds: number[];
  }) {
    (async () => {
      try {
        const payload = {
          nome: dados.nome,
          data: dados.data,
          descricao: dados.descricao || null,
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

  function handleExcluirEvento(id: number) {
    (async () => {
      try {
        await apiFetch<void>(`/api/eventos/${id}`, {
          method: "DELETE",
        });
        setEventos((prev) => prev.filter((e) => e.id !== id));
        toast.success("Evento excluído com sucesso!");
        setModal({ type: "none" });
      } catch {
        toast.error("Erro ao excluir evento");
      }
    })();
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
          onClose={() => setModal({ type: "none" })}
          onSave={handleCriarEvento}
        />
      )}

      {modal.type === "view" && (
        <EventViewModal
          evento={modal.evento}
          responsavelNome={modal.evento.responsavelId ? responsaveisMap[modal.evento.responsavelId] : undefined}
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
          canEdit={isLeader}
        />
      )}

      {modal.type === "edit" && (
        <EventEditModal
          evento={modal.evento}
          onClose={() => setModal({ type: "none" })}
          onSave={handleEditarEvento}
          onDelete={handleExcluirEvento}
        />
      )}
    </div>
  );
}

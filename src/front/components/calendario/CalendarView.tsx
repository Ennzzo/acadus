"use client";

import { useState } from "react";
import { Evento } from "@/types/evento";
import { eventosMock, membrosMock } from "@/data/mocks/eventos";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import EventFormModal from "./EventFormModal";
import EventViewModal from "./EventViewModal";
import EventEditModal from "./EventEditModal";
import styles from "./CalendarView.module.css";

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "view"; evento: Evento }
  | { type: "edit"; evento: Evento };

export default function CalendarView() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [eventos, setEventos] = useState<Evento[]>(eventosMock);
  const [modal, setModal] = useState<ModalState>({ type: "none" });

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

  function handleCriarEvento(dados: {
    nome: string;
    data: string;
    descricao: string;
    membrosIds: number[];
  }) {
    const novoEvento: Evento = {
      id: Math.max(0, ...eventos.map((e) => e.id)) + 1,
      nome: dados.nome,
      data: dados.data,
      descricao: dados.descricao || null,
      projetoId: null,
      membros: dados.membrosIds
        .map((id) => membrosMock.find((m) => m.id === id))
        .filter(Boolean) as Evento["membros"],
    };
    setEventos((prev) => [...prev, novoEvento]);
    setModal({ type: "none" });
  }

  function handleEditarEvento(dados: {
    id: number;
    nome: string;
    data: string;
    descricao: string;
    membrosIds: number[];
  }) {
    setEventos((prev) =>
      prev.map((e) =>
        e.id === dados.id
          ? {
              ...e,
              nome: dados.nome,
              data: dados.data,
              descricao: dados.descricao || null,
              membros: dados.membrosIds
                .map((id) => membrosMock.find((m) => m.id === id))
                .filter(Boolean) as Evento["membros"],
            }
          : e
      )
    );
    setModal({ type: "none" });
  }

  function handleExcluirEvento(id: number) {
    setEventos((prev) => prev.filter((e) => e.id !== id));
    setModal({ type: "none" });
  }

  // Filter events for current month
  const eventosMes = eventos.filter((e) => {
    const d = new Date(e.data + "T00:00:00");
    return d.getFullYear() === ano && d.getMonth() === mes;
  });

  return (
    <div className={styles.container}>
      <CalendarHeader
        mes={mes}
        ano={ano}
        onPrev={irMesAnterior}
        onNext={irProximoMes}
        onAddEvento={() => setModal({ type: "create" })}
      />
      <CalendarGrid
        mes={mes}
        ano={ano}
        eventos={eventosMes}
        onEventoClick={(evento) => setModal({ type: "view", evento })}
      />

      {/* Modais */}
      {modal.type === "create" && (
        <EventFormModal
          onClose={() => setModal({ type: "none" })}
          onSave={handleCriarEvento}
        />
      )}

      {modal.type === "view" && (
        <EventViewModal
          evento={modal.evento}
          onClose={() => setModal({ type: "none" })}
          onEdit={() => setModal({ type: "edit", evento: modal.evento })}
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

"use client";

import { Evento } from "@/types/evento";
import styles from "./CalendarGrid.module.css";

interface CalendarGridProps {
  mes: number;
  ano: number;
  eventos: Evento[];
  onEventoClick: (evento: Evento) => void;
  onDayClick?: (data: string) => void;
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CORES_EVENTO = [
  "#2563eb",
  "#059669",
  "#d97706",
  "#dc2626",
  "#db2777",
  "#7c2d12",
  "#4338ca",
];

function getCorEvento(id: number): string {
  return CORES_EVENTO[id % CORES_EVENTO.length];
}

function getEventoKey(evento: Evento, index: number) {
  return `${evento.tipo ?? "evento"}-${evento.id}-${evento.data}-${index}`;
}

export default function CalendarGrid({
  mes,
  ano,
  eventos,
  onEventoClick,
  onDayClick,
}: CalendarGridProps) {
  const primeiroDia = new Date(ano, mes, 1);
  const diaSemanaInicio = primeiroDia.getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const hoje = new Date();
  const isHoje = (dia: number) =>
    dia === hoje.getDate() &&
    mes === hoje.getMonth() &&
    ano === hoje.getFullYear();

  function handleDayClick(dia: number) {
    const dataStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    onDayClick?.(dataStr);
  }

  // Build the grid cells
  const cells: { dia: number | null; eventosNoDia: Evento[] }[] = [];

  // Empty cells before first day
  for (let i = 0; i < diaSemanaInicio; i++) {
    cells.push({ dia: null, eventosNoDia: [] });
  }

  // Day cells
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const dataStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const eventosNoDia = eventos.filter((e) => e.data === dataStr);
    cells.push({ dia, eventosNoDia });
  }

  // Always render 6 full weeks so months with 31 days do not change the grid height.
  while (cells.length < 42) {
    cells.push({ dia: null, eventosNoDia: [] });
  }

  return (
    <div className={styles.gridWrapper}>
      {/* Week day headers */}
      <div className={styles.weekHeader}>
        {DIAS_SEMANA.map((d) => (
          <div key={d} className={styles.weekDay}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={styles.grid}>
        {cells.map((cell, idx) => (
          <div
            key={idx}
            className={`${styles.cell} ${cell.dia === null ? styles.cellEmpty : ""} ${cell.dia !== null && isHoje(cell.dia) ? styles.cellToday : ""}`}
            onClick={() => cell.dia !== null && handleDayClick(cell.dia)}
            style={{ cursor: cell.dia !== null ? "pointer" : "default" }}
          >
            {cell.dia !== null && (
              <>
                <span className={`${styles.dayNumber} ${isHoje(cell.dia) ? styles.dayToday : ""}`}>
                  {cell.dia}
                </span>
                <div className={styles.eventsList}>
                  {cell.eventosNoDia.map((evento, eventoIndex) => (
                    <button
                      key={getEventoKey(evento, eventoIndex)}
                      className={`${styles.eventTag} ${evento.tipo === "tarefa" ? styles.taskTag : ""}`}
                      style={{ backgroundColor: evento.cor || getCorEvento(evento.id) }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventoClick(evento);
                      }}
                      title={evento.nome}
                    >
                      {evento.nome}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

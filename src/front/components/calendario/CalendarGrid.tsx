"use client";

import { Evento } from "@/types/evento";
import styles from "./CalendarGrid.module.css";

interface CalendarGridProps {
  mes: number;
  ano: number;
  eventos: Evento[];
  onEventoClick: (evento: Evento) => void;
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CORES_EVENTO = [
  "#7c3aed",
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

export default function CalendarGrid({
  mes,
  ano,
  eventos,
  onEventoClick,
}: CalendarGridProps) {
  const primeiroDia = new Date(ano, mes, 1);
  const diaSemanaInicio = primeiroDia.getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const hoje = new Date();
  const isHoje = (dia: number) =>
    dia === hoje.getDate() &&
    mes === hoje.getMonth() &&
    ano === hoje.getFullYear();

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

  // Fill remaining cells to complete the last week
  const restante = 7 - (cells.length % 7);
  if (restante < 7) {
    for (let i = 0; i < restante; i++) {
      cells.push({ dia: null, eventosNoDia: [] });
    }
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
          >
            {cell.dia !== null && (
              <>
                <span className={`${styles.dayNumber} ${isHoje(cell.dia) ? styles.dayToday : ""}`}>
                  {cell.dia}
                </span>
                <div className={styles.eventsList}>
                  {cell.eventosNoDia.slice(0, 3).map((evento) => (
                    <button
                      key={evento.id}
                      className={styles.eventTag}
                      style={{ backgroundColor: getCorEvento(evento.id) }}
                      onClick={() => onEventoClick(evento)}
                      title={evento.nome}
                    >
                      {evento.nome}
                    </button>
                  ))}
                  {cell.eventosNoDia.length > 3 && (
                    <span className={styles.moreTag}>
                      +{cell.eventosNoDia.length - 3} mais
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

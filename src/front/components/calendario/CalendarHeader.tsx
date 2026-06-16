"use client";

import styles from "./CalendarHeader.module.css";

interface CalendarHeaderProps {
  mes: number;
  ano: number;
  isLeader?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onAddEvento: () => void;
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function CalendarHeader({
  mes,
  ano,
  isLeader = false,
  onPrev,
  onNext,
  onAddEvento,
}: CalendarHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.navGroup}>
        <button className={styles.navBtn} onClick={onPrev} title="Mês anterior">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className={styles.title}>
          {MESES[mes]} {ano}
        </h2>
        <button className={styles.navBtn} onClick={onNext} title="Próximo mês">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {isLeader && (
        <button className={styles.addBtn} onClick={onAddEvento}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Adicionar evento
        </button>
      )}
    </div>
  );
}

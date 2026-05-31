"use client";

import styles from "./ProjectsToolbar.module.css";

export type ProjectViewMode = "cards" | "tabela";
export type SortBy = "nome" | "criacao";

interface ProjectsToolbarProps {
  sortBy: SortBy;
  onSortChange: (v: SortBy) => void;
  viewMode: ProjectViewMode;
  onViewModeChange: (v: ProjectViewMode) => void;
  total: number;
}

const sortOptions: { value: SortBy; label: string }[] = [
  { value: "nome", label: "Nome" },
  { value: "criacao", label: "Data de criação" },
];

export default function ProjectsToolbar({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  total,
}: ProjectsToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.selectWrapper}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.selectIcon}>
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="9" y2="18" />
        </svg>
        <select
          id="projetos-sort"
          className={styles.select}
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortBy)}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>Ordenar: {opt.label}</option>
          ))}
        </select>
      </div>

      <span className={styles.count}>
        {total} {total === 1 ? "projeto" : "projetos"}
      </span>

      <div className={styles.toggleGroup} role="group" aria-label="Modo de visualização">
        <button
          id="view-cards"
          className={`${styles.toggleBtn} ${viewMode === "cards" ? styles.toggleActive : ""}`}
          onClick={() => onViewModeChange("cards")}
          title="Visualização em cards"
          aria-pressed={viewMode === "cards"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
        </button>
        <button
          id="view-tabela"
          className={`${styles.toggleBtn} ${viewMode === "tabela" ? styles.toggleActive : ""}`}
          onClick={() => onViewModeChange("tabela")}
          title="Visualização em tabela"
          aria-pressed={viewMode === "tabela"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

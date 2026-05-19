"use client";

import { StatusProjeto } from "@/types/projeto";
import styles from "./ProjectsToolbar.module.css";

export type ProjectViewMode = "cards" | "tabela";

interface ProjectsToolbarProps {
  query: string;
  onQueryChange: (v: string) => void;
  statusFilter: StatusProjeto | "TODOS";
  onStatusChange: (v: StatusProjeto | "TODOS") => void;
  sortBy: "nome" | "criacao";
  onSortChange: (v: "nome" | "criacao") => void;
  viewMode: ProjectViewMode;
  onViewModeChange: (v: ProjectViewMode) => void;
  total: number;
  filtered: number;
}

const statusOptions: { value: StatusProjeto | "TODOS"; label: string }[] = [
  { value: "TODOS", label: "Todos os status" },
  { value: "ATIVO", label: "Ativo" },
  { value: "CONCLUIDO", label: "Concluído" },
];

const sortOptions: { value: "nome" | "criacao"; label: string }[] = [
  { value: "nome", label: "Nome" },
  { value: "criacao", label: "Data de criação" },
];

export default function ProjectsToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  total,
  filtered,
}: ProjectsToolbarProps) {
  return (
    <div className={styles.toolbar}>
      {/* Search */}
      <label className={styles.searchBox}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          id="projetos-search"
          type="text"
          placeholder="Pesquisar projetos..."
          className={styles.searchInput}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        {query && (
          <button className={styles.clearSearch} onClick={() => onQueryChange("")} title="Limpar pesquisa">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </label>

      {/* Status filter */}
      <div className={styles.selectWrapper}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.selectIcon}>
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <select
          id="projetos-status-filter"
          className={styles.select}
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as StatusProjeto | "TODOS")}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className={styles.selectWrapper}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.selectIcon}>
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="9" y2="18" />
        </svg>
        <select
          id="projetos-sort"
          className={styles.select}
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as "nome" | "criacao")}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>Ordenar: {opt.label}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <span className={styles.count}>
        {filtered === total ? `${total} projetos` : `${filtered} de ${total}`}
      </span>

      {/* View mode toggle */}
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

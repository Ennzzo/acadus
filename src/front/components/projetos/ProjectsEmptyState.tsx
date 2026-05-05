import styles from "./ProjectsEmptyState.module.css";

interface ProjectsEmptyStateProps {
  query: string;
  onClear: () => void;
}

export default function ProjectsEmptyState({ query, onClear }: ProjectsEmptyStateProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.iconBox}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </div>
      <h3 className={styles.title}>Nenhum projeto encontrado</h3>
      <p className={styles.desc}>
        {query
          ? `Nenhum resultado para "${query}". Tente ajustar o filtro ou a pesquisa.`
          : "Nenhum projeto corresponde ao filtro selecionado."}
      </p>
      <button className={styles.clearBtn} onClick={onClear}>
        Limpar filtros
      </button>
    </div>
  );
}

import styles from "./ProjectsEmptyState.module.css";

export default function ProjectsEmptyState() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.iconBox}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h3 className={styles.title}>Nenhum projeto disponível</h3>
      <p className={styles.desc}>Crie um projeto ou aguarde o convite para participar de uma equipe.</p>
    </div>
  );
}

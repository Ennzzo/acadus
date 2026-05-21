import { Projeto } from "@/types/projeto";
import styles from "./ProjectsHeader.module.css";

interface ProjectsHeaderProps {
  projetos: Projeto[];
  onNewProject?: () => void;
}

export default function ProjectsHeader({ projetos, onNewProject }: ProjectsHeaderProps) {
  const total = projetos.length;
  const ativos = projetos.filter((p) => p.status === "ATIVO").length;
  const concluidos = projetos.filter((p) => p.status === "CONCLUIDO").length;

  return (
    <div className={styles.header}>
      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.title}>Meus Projetos</h1>
          <p className={styles.subtitle}>{total} {total === 1 ? "projeto" : "projetos"} no total</p>
        </div>
        <button className={styles.newBtn} onClick={onNewProject} id="btn-novo-projeto">
          + Novo Projeto
        </button>
      </div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={`${styles.dot} ${styles.dotBlue}`} />
          <span className={styles.statValue}>{ativos}</span>
          <span className={styles.statLabel}>Ativos</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.dot} ${styles.dotGreen}`} />
          <span className={styles.statValue}>{concluidos}</span>
          <span className={styles.statLabel}>Concluídos</span>
        </div>
      </div>
    </div>
  );
}

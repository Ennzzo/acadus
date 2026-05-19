import { Projeto, StatusProjeto } from "@/types/projeto";
import styles from "./ProjectsHeader.module.css";

interface ProjectsHeaderProps {
  projetos: Projeto[];
  onNewProject?: () => void;
}

const statConfig: { status: StatusProjeto; label: string; colorClass: string }[] = [
  { status: "ATIVO",     label: "Ativos",     colorClass: "dotBlue" },
  { status: "CONCLUIDO", label: "Concluídos", colorClass: "dotGreen" },
];

export default function ProjectsHeader({ projetos, onNewProject }: ProjectsHeaderProps) {
  const total = projetos.length;

  const counts = statConfig.map((cfg) => ({
    ...cfg,
    value: projetos.filter((p) => p.status === cfg.status).length,
  }));

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
        {counts.map(({ label, value, colorClass }) => (
          <div key={label} className={styles.stat}>
            <span className={`${styles.dot} ${styles[colorClass]}`} />
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

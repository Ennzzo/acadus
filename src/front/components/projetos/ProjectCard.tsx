import Link from "next/link";
import { Projeto, StatusProjeto } from "@/types/projeto";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
  projeto: Projeto;
}

const statusLabel: Record<StatusProjeto, string> = {
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  PENDENTE: "Pendente",
  ATRASADO: "Atrasado",
};

const statusClass: Record<StatusProjeto, string> = {
  EM_ANDAMENTO: styles.statusBlue,
  CONCLUIDO: styles.statusGreen,
  PENDENTE: styles.statusYellow,
  ATRASADO: styles.statusRed,
};

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export default function ProjectCard({ projeto }: ProjectCardProps) {
  return (
    <Link href={`/projetos/${projeto.id}`} className={styles.card}>
      <div className={styles.top}>
        <div className={styles.meta}>
          <span className={styles.disciplina}>{projeto.disciplina}</span>
          <span className={`${styles.status} ${statusClass[projeto.status]}`}>
            {statusLabel[projeto.status]}
          </span>
        </div>
        <h3 className={styles.nome}>{projeto.nome}</h3>
        <p className={styles.descricao}>{projeto.descricao}</p>
      </div>

      <div className={styles.bottom}>
        <div className={styles.progressRow}>
          <span className={styles.progressLabel}>Progresso</span>
          <span className={styles.progressValue}>{projeto.progresso}%</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${projeto.progresso}%` }}
          />
        </div>
        <div className={styles.footer}>
          <span className={styles.professor}>👤 {projeto.professor}</span>
          <span className={styles.prazo}>📅 {formatDate(projeto.dataEntrega)}</span>
        </div>
      </div>
    </Link>
  );
}

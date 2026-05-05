import Link from "next/link";
import { Projeto, StatusProjeto } from "@/types/projeto";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
  projeto: Projeto;
  onEdit?: (projeto: Projeto) => void;
  onDelete?: (projeto: Projeto) => void;
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

export default function ProjectCard({ projeto, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div className={styles.cardWrapper}>
      {/* Botões de ação — aparecem no hover */}
      <div className={styles.cardActions}>
        {onEdit && (
          <button
            className={styles.actionIcon}
            title="Editar projeto"
            onClick={(e) => { e.preventDefault(); onEdit(projeto); }}
            aria-label="Editar projeto"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            className={`${styles.actionIcon} ${styles.actionIconDelete}`}
            title="Excluir projeto"
            onClick={(e) => { e.preventDefault(); onDelete(projeto); }}
            aria-label="Excluir projeto"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        )}
      </div>

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
    </div>
  );
}

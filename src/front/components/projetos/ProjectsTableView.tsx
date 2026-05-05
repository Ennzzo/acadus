import Link from "next/link";
import { Projeto, StatusProjeto } from "@/types/projeto";
import styles from "./ProjectsTableView.module.css";

interface ProjectsTableViewProps {
  projetos: Projeto[];
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

function isOverdue(iso: string): boolean {
  return new Date(iso) < new Date();
}

export default function ProjectsTableView({ projetos }: ProjectsTableViewProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thNome}>Nome</th>
            <th>Disciplina</th>
            <th>Professor</th>
            <th>Status</th>
            <th>Progresso</th>
            <th>Prazo</th>
            <th className={styles.thAcoes} />
          </tr>
        </thead>
        <tbody>
          {projetos.map((projeto) => {
            const overdue = projeto.status !== "CONCLUIDO" && isOverdue(projeto.dataEntrega);
            return (
              <tr key={projeto.id} className={styles.row}>
                {/* Nome */}
                <td className={styles.tdNome}>
                  <Link href={`/projetos/${projeto.id}`} className={styles.nomeLink}>
                    <span className={styles.nomeIcon}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    </span>
                    {projeto.nome}
                  </Link>
                </td>

                {/* Disciplina */}
                <td className={styles.tdMeta}>{projeto.disciplina}</td>

                {/* Professor */}
                <td className={styles.tdMeta}>{projeto.professor}</td>

                {/* Status */}
                <td>
                  <span className={`${styles.statusBadge} ${statusClass[projeto.status]}`}>
                    {statusLabel[projeto.status]}
                  </span>
                </td>

                {/* Progresso */}
                <td className={styles.tdProgresso}>
                  <div className={styles.progressRow}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${projeto.progresso}%` }}
                      />
                    </div>
                    <span className={styles.progressValue}>{projeto.progresso}%</span>
                  </div>
                </td>

                {/* Prazo */}
                <td className={`${styles.tdPrazo} ${overdue ? styles.prazoAtrasado : ""}`}>
                  {overdue && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  )}
                  {formatDate(projeto.dataEntrega)}
                </td>

                {/* Ações */}
                <td className={styles.tdAcoes}>
                  <Link href={`/projetos/${projeto.id}`} className={styles.openBtn} title="Abrir projeto">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Abrir
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

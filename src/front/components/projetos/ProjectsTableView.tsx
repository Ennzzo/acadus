import Link from "next/link";
import { setSelectedProjectId } from "@/lib/auth";
import { Projeto, StatusProjeto } from "@/types/projeto";
import styles from "./ProjectsTableView.module.css";

interface ProjectsTableViewProps {
  projetos: Projeto[];
  currentUserEmail?: string;
  onLeave: (projeto: Projeto) => void;
}

const statusLabel: Record<StatusProjeto, string> = {
  ATIVO: "Ativo",
  CONCLUIDO: "Concluído",
};

const statusClass: Record<StatusProjeto, string> = {
  ATIVO: styles.statusBlue,
  CONCLUIDO: styles.statusGreen,
};

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export default function ProjectsTableView({ projetos, currentUserEmail, onLeave }: ProjectsTableViewProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thNome}>Nome</th>
            <th>Status</th>
            <th>Criação</th>
            <th className={styles.thAcoes} />
          </tr>
        </thead>
        <tbody>
          {projetos.map((projeto) => {
            return (
              <tr key={projeto.id} className={styles.row}>
                <td className={styles.tdNome}>
                  <Link
                    href={`/projetos/${projeto.id}`}
                    className={styles.nomeLink}
                    onClick={() => setSelectedProjectId(projeto.id)}
                  >
                    <span className={styles.nomeIcon}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    </span>
                    {projeto.nomeProjeto}
                  </Link>
                </td>

                <td>
                  <span className={`${styles.statusBadge} ${statusClass[projeto.status]}`}>
                    {statusLabel[projeto.status]}
                  </span>
                </td>

                <td className={styles.tdPrazo}>
                  {formatDate(projeto.dataCriacao)}
                </td>

                <td className={styles.tdAcoes}>
                  <div className={styles.actions}>
                    {projeto.liderEmail !== currentUserEmail && (
                      <button className={styles.leaveBtn} onClick={() => onLeave(projeto)}>Sair</button>
                    )}
                    <Link
                      href={`/projetos/${projeto.id}`}
                      className={styles.openBtn}
                      title="Abrir projeto"
                      onClick={() => setSelectedProjectId(projeto.id)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      Abrir
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

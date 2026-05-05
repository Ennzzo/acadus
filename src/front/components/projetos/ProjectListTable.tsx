import { ProjetoLista } from "@/types/projeto";
import styles from "./ProjectListTable.module.css";

interface ProjectListTableProps {
  listas: ProjetoLista[];
}

const prioridadeLabel: Record<string, string> = {
  ALTA: "Alta",
  MEDIA: "Média",
  BAIXA: "Baixa",
};

const prioridadeClass: Record<string, string> = {
  ALTA: "prioAlta",
  MEDIA: "prioMedia",
  BAIXA: "prioBaixa",
};

export default function ProjectListTable({ listas }: ProjectListTableProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button className={styles.filterBtn}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filtros
        </button>
        <div className={styles.toolbarRight}>
          <span className={styles.updateText}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Atualização: agora há pouco
          </span>
          <button className={styles.autoBtn}>
            <span className={styles.dot} />
            Atualização automática: Ligado
          </button>
          <button className={styles.personalizeBtn}>Personalizar</button>
          <button className={styles.addCardBtn}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Adicionar cartão
          </button>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thNome}>NOME</th>
            <th>COR</th>
            <th>PROGRESSO</th>
            <th>INÍCIO</th>
            <th>TÉRMINO</th>
            <th>PRIORIDADE</th>
            <th>PROPRIETÁRIO</th>
            <th className={styles.thAdd}>
              <button className={styles.addColBtn}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {listas.map((lista) => (
            <tr key={lista.id} className={styles.row}>
              <td className={styles.tdNome}>
                <span className={styles.rowIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </span>
                {lista.nome}
              </td>
              <td>
                <div className={styles.colorDot} style={{ background: lista.cor }} />
              </td>
              <td>
                <div className={styles.progressCell}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${lista.progresso}%` }}
                    />
                  </div>
                  <span className={styles.progressText}>
                    {lista.tarefasConcluidas}/{lista.totalTarefas}
                  </span>
                </div>
              </td>
              <td className={styles.tdDate}>
                {lista.inicio ? (
                  <span>{new Date(lista.inicio).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                ) : (
                  <button className={styles.emptyCell}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </button>
                )}
              </td>
              <td className={styles.tdDate}>
                {lista.termino ? (
                  <span>{new Date(lista.termino).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                ) : (
                  <button className={styles.emptyCell}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </button>
                )}
              </td>
              <td>
                {lista.prioridade ? (
                  <span className={`${styles.prioTag} ${styles[prioridadeClass[lista.prioridade]]}`}>
                    {prioridadeLabel[lista.prioridade]}
                  </span>
                ) : (
                  <button className={styles.emptyCell}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="17 11 21 7 17 3" /><line x1="21" y1="7" x2="9" y2="7" />
                      <polyline points="7 21 3 17 7 13" /><line x1="15" y1="17" x2="3" y2="17" />
                    </svg>
                  </button>
                )}
              </td>
              <td>
                {lista.proprietario ? (
                  <div className={styles.avatar}>{lista.proprietario}</div>
                ) : (
                  <button className={styles.emptyCell}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </button>
                )}
              </td>
              <td />
            </tr>
          ))}
        </tbody>
      </table>

      <button className={styles.newListBtn}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Nova lista
      </button>
    </div>
  );
}

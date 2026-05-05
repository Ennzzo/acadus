import { ProjetoDetalhe } from "@/types/projeto";
import styles from "./ProjectDetailOverview.module.css";

interface ProjectDetailOverviewProps {
  projeto: ProjetoDetalhe;
}

const avatarColors = [
  "#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
];

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export default function ProjectDetailOverview({ projeto }: ProjectDetailOverviewProps) {
  return (
    <div className={styles.wrapper}>
      {/* ── Título ─────────────────────────────── */}
      <h1 className={styles.titulo}>{projeto.nome}</h1>

      {/* ── Conteúdo principal (3 colunas) ─────── */}
      <div className={styles.mainGrid}>
        {/* Col 1: imagem / capa */}
        <div className={styles.coverBox}>
          <div className={styles.coverPlaceholder}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>Capa do projeto</span>
          </div>
        </div>

        {/* Col 2: descrição */}
        <div className={styles.descBox}>
          <p className={styles.descLabel}>Descrição:</p>
          <p className={styles.descText}>
            {projeto.descricao || "Nenhuma descrição fornecida."}
          </p>
        </div>

        {/* Col 3: equipe */}
        <div className={styles.equipeBox}>
          <h2 className={styles.equipeTitle}>Equipe</h2>
          <ul className={styles.membroList}>
            {projeto.membros.map((iniciais, idx) => (
              <li key={iniciais} className={styles.membroItem}>
                <span
                  className={styles.membroAvatar}
                  style={{ background: avatarColors[idx % avatarColors.length] }}
                >
                  {iniciais}
                </span>
                <span className={styles.membroNome}>{iniciais}</span>
              </li>
            ))}
            {projeto.membros.length === 0 && (
              <li className={styles.semMembros}>Nenhum membro adicionado.</li>
            )}
          </ul>
        </div>
      </div>

      {/* ── Divisor ────────────────────────────── */}
      <hr className={styles.divider} />

      {/* ── Metadados ──────────────────────────── */}
      <div className={styles.metaGrid}>
        {/* Data de entrega */}
        <div className={styles.metaField}>
          <label className={styles.metaLabel}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Data de entrega
          </label>
          <div className={styles.metaValue}>{formatDate(projeto.dataEntrega)}</div>
        </div>

        {/* Espaço / equipe */}
        <div className={styles.metaField}>
          <label className={styles.metaLabel}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Equipe / Espaço
          </label>
          <div className={styles.metaValue}>{projeto.espaco}</div>
        </div>

        {/* Disciplina */}
        <div className={styles.metaField}>
          <label className={styles.metaLabel}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Disciplina
          </label>
          <div className={styles.metaValue}>{projeto.disciplina}</div>
        </div>

        {/* Professor */}
        <div className={styles.metaField}>
          <label className={styles.metaLabel}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Professor
          </label>
          <div className={styles.metaValue}>{projeto.professor}</div>
        </div>

        {/* Progresso */}
        <div className={styles.metaField}>
          <label className={styles.metaLabel}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Progresso geral
          </label>
          <div className={styles.progressRow}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${projeto.progresso}%` }} />
            </div>
            <span className={styles.progressPct}>{projeto.progresso}%</span>
          </div>
          <span className={styles.progressSub}>
            {projeto.tarefasConcluidas} de {projeto.totalTarefas} tarefas concluídas
          </span>
        </div>
      </div>
    </div>
  );
}

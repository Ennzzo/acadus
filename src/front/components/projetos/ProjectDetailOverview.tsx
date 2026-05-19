import { Projeto, StatusProjeto } from "@/types/projeto";
import styles from "./ProjectDetailOverview.module.css";

interface ProjectDetailOverviewProps {
  projeto: Projeto;
}

const statusLabel: Record<StatusProjeto, string> = {
  ATIVO: "Ativo",
  CONCLUIDO: "Concluído",
};

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export default function ProjectDetailOverview({ projeto }: ProjectDetailOverviewProps) {
  return (
    <div className={styles.wrapper}>
      {/* ── Título ─────────────────────────────── */}
      <h1 className={styles.titulo}>{projeto.nomeProjeto}</h1>

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

        {/* Col 3: status */}
        <div className={styles.equipeBox}>
          <h2 className={styles.equipeTitle}>Status</h2>
          <p className={styles.descText}>{statusLabel[projeto.status]}</p>
        </div>
      </div>

      {/* ── Divisor ────────────────────────────── */}
      <hr className={styles.divider} />

      {/* ── Metadados ──────────────────────────── */}
      <div className={styles.metaGrid}>
        {/* Data de criacao */}
        <div className={styles.metaField}>
          <label className={styles.metaLabel}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Data de criacao
          </label>
          <div className={styles.metaValue}>{formatDate(projeto.dataCriacao)}</div>
        </div>
      </div>
    </div>
  );
}

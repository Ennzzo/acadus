import { Projeto, StatusProjeto } from "@/types/projeto";
import styles from "./ProjectDetailOverview.module.css";

interface ProjectDetailOverviewProps {
  projeto: Projeto;
  onEdit?: () => void;
}

const statusLabel: Record<StatusProjeto, string> = {
  ATIVO: "Ativo",
  CONCLUIDO: "Concluído",
};

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export default function ProjectDetailOverview({ projeto, onEdit }: ProjectDetailOverviewProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.titleRow}>
        <h1 className={styles.titulo}>{projeto.nomeProjeto}</h1>
        {onEdit && (
          <button type="button" className={styles.editButton} onClick={onEdit}>
            Editar projeto
          </button>
        )}
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.coverBox}>
          {projeto.capaUrl ? (
            <div
              className={styles.coverImage}
              style={{ backgroundImage: `url(${projeto.capaUrl})` }}
            />
          ) : (
            <div className={styles.coverPlaceholder}>
              <span>Capa do projeto</span>
            </div>
          )}
        </div>

        <div className={styles.descBox}>
          <p className={styles.descLabel}>Descrição:</p>
          <p className={styles.descText}>
            {projeto.descricao || "Nenhuma descrição fornecida."}
          </p>
        </div>

        <div className={styles.equipeBox}>
          <h2 className={styles.equipeTitle}>Status</h2>
          <p className={styles.descText}>{statusLabel[projeto.status]}</p>
          <h2 className={styles.equipeTitle}>Líder</h2>
          <p className={styles.descText}>{projeto.liderEmail || "Não informado"}</p>
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.metaGrid}>
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

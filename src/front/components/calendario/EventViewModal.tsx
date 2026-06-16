"use client";

import { useEffect } from "react";
import { Evento } from "@/types/evento";
import styles from "./EventModal.module.css";

interface EventViewModalProps {
  evento: Evento;
  responsavelNome?: string;
  membrosInfo?: Array<{ id: number; nome?: string; sobrenome?: string; email?: string }>;
  onClose: () => void;
  onEdit: () => void;
  canEdit?: boolean;
}

export default function EventViewModal({
  evento,
  responsavelNome,
  membrosInfo,
  onClose,
  onEdit,
  canEdit = false,
}: EventViewModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const dataFormatada = new Date(evento.data + "T00:00:00").toLocaleDateString(
    "pt-BR",
    { day: "2-digit", month: "long", year: "numeric" }
  );

  return (
    <div className={styles.overlay} onClick={onClose} aria-modal="true" role="dialog">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{evento.nome}</h2>
          <button className={styles.closeBtn} onClick={onClose} title="Fechar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.form}>
          {/* Nome do Evento */}
          <div className={styles.detailRow}>
            <label className={styles.detailLabel}>Nome do Evento</label>
            <input
              type="text"
              value={evento.nome}
              disabled
              className={styles.readOnlyInput}
            />
          </div>

          {/* Data */}
          <div className={styles.detailRow}>
            <label className={styles.detailLabel}>Data</label>
            <input
              type="text"
              value={dataFormatada}
              disabled
              className={styles.readOnlyInput}
            />
          </div>

          {/* Responsável */}
          <div className={styles.detailRow}>
            <label className={styles.detailLabel}>Responsável</label>
            <input
              type="text"
              value={responsavelNome || "Não definido"}
              disabled
              className={styles.readOnlyInput}
            />
          </div>

          {/* Membros */}
          <div className={styles.detailRow}>
            <label className={styles.detailLabel}>Membros</label>
            {membrosInfo && membrosInfo.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {membrosInfo.map((membro) => (
                  <div key={membro.id} style={{ fontSize: "0.9rem", color: "#334155" }}>
                    {membro.nome && membro.sobrenome ? `${membro.nome} ${membro.sobrenome}` : membro.email}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>Nenhum membro associado</div>
            )}
          </div>

          {/* Descrição */}
          <div className={styles.detailRow}>
            <label className={styles.detailLabel}>Descrição</label>
            <textarea
              value={evento.descricao || ""}
              disabled
              rows={3}
              className={styles.readOnlyTextarea}
              style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
            />
          </div>

          {/* Ações */}
          <div className={styles.actions}>
            {canEdit && (
              <button className={styles.editBtn} onClick={onEdit}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar
              </button>
            )}
            <button className={styles.cancelBtn} onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

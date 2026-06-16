"use client";

import { useEffect, useState } from "react";
import { Evento } from "@/types/evento";
import styles from "./EventDeleteConfirmModal.module.css";

interface EventDeleteConfirmModalProps {
  evento: Evento;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function EventDeleteConfirmModal({
  evento,
  onClose,
  onConfirm,
}: EventDeleteConfirmModalProps) {
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleConfirm() {
    try {
      setDeleting(true);
      setError("");
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível excluir o evento.");
      setDeleting(false);
    }
  }

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Confirmar exclusão"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconBox}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>

        <h2 className={styles.title}>Excluir evento</h2>
        <p className={styles.desc}>
          Tem certeza que deseja excluir o evento{" "}
          <strong className={styles.eventName}>&ldquo;{evento.nome}&rdquo;</strong>?
          <br />
          Esta ação não pode ser desfeita.
        </p>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.actions}>
          <button
            className={styles.deleteBtn}
            onClick={handleConfirm}
            disabled={deleting}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
            {deleting ? "Excluindo..." : "Confirmar exclusão"}
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

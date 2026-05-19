"use client";

import { useEffect } from "react";
import { Projeto } from "@/types/projeto";
import styles from "./ProjectDeleteModal.module.css";

interface ProjectDeleteModalProps {
  projeto: Projeto;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ProjectDeleteModal({
  projeto,
  onClose,
  onConfirm,
}: ProjectDeleteModalProps) {
  // fecha com Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleConfirm() {
    onConfirm();
    onClose();
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
        {/* Ícone de aviso */}
        <div className={styles.iconBox}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" /><path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>

        {/* Título */}
        <h2 className={styles.title}>Excluir projeto</h2>
        <p className={styles.desc}>
          Tem certeza que deseja excluir o projeto{" "}
          <strong className={styles.nomeProjeto}>&ldquo;{projeto.nomeProjeto}&rdquo;</strong>?
          <br />
          Esta ação não pode ser desfeita.
        </p>

        {/* Confirmação */}
        <div className={styles.confirmation}>
          <span className={styles.confirmLabel}>Confirmar exclusão?</span>
          <div className={styles.options}>
            <label className={`${styles.option} ${styles.optionSim}`}>
              <input
                type="radio"
                name="confirmar"
                value="sim"
                className={styles.radio}
                defaultChecked
              />
              Sim, excluir
            </label>
            <label className={`${styles.option} ${styles.optionNao}`}>
              <input
                type="radio"
                name="confirmar"
                value="nao"
                className={styles.radio}
                onClick={onClose}
              />
              Não, cancelar
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            id="btn-confirmar-exclusao"
            className={styles.deleteBtn}
            onClick={handleConfirm}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
            Confirmar exclusão
          </button>
          <button
            id="btn-cancelar-exclusao"
            className={styles.cancelBtn}
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

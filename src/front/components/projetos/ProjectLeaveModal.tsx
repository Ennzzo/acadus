"use client";

import { useState } from "react";
import { Projeto } from "@/types/projeto";
import styles from "./ProjectLeaveModal.module.css";

interface ProjectLeaveModalProps {
  projeto: Projeto;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function ProjectLeaveModal({ projeto, onClose, onConfirm }: ProjectLeaveModalProps) {
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");

  async function leave() {
    try {
      setLeaving(true);
      setError("");
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível sair do projeto.");
    } finally {
      setLeaving(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <h2>Sair do projeto</h2>
        <p>
          Você deixará a equipe de <strong>{projeto.nomeProjeto}</strong>. O histórico continuará salvo e o chat ficará disponível apenas para consulta.
        </p>
        {error && <span className={styles.error}>{error}</span>}
        <div className={styles.actions}>
          <button onClick={onClose}>Cancelar</button>
          <button className={styles.leave} onClick={leave} disabled={leaving}>
            {leaving ? "Saindo..." : "Sair do projeto"}
          </button>
        </div>
      </div>
    </div>
  );
}

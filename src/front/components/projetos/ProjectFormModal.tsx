"use client";

import { useEffect, useRef, useState } from "react";
import { Projeto } from "@/types/projeto";
import styles from "./ProjectFormModal.module.css";

interface ProjectFormModalProps {
  mode: "criar" | "editar";
  projeto?: Projeto; // preenchido no modo editar
  onClose: () => void;
  onSave: (dados: { nome: string; descricao: string }) => void;
}

export default function ProjectFormModal({
  mode,
  projeto,
  onClose,
  onSave,
}: ProjectFormModalProps) {
  const [nome, setNome] = useState(projeto?.nome ?? "");
  const [descricao, setDescricao] = useState(projeto?.descricao ?? "");
  const [errors, setErrors] = useState<{ nome?: string; descricao?: string }>({});
  const nomeRef = useRef<HTMLInputElement>(null);

  // foca no primeiro campo ao abrir
  useEffect(() => {
    nomeRef.current?.focus();
  }, []);

  // fecha com Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function validate(): boolean {
    const errs: typeof errors = {};
    if (nome.trim().length < 3) {
      errs.nome = "O nome deve ter pelo menos 3 caracteres.";
    } else if (nome.trim().length > 100) {
      errs.nome = "O nome deve ter no máximo 100 caracteres.";
    }
    if (descricao.length > 500) {
      errs.descricao = "A descrição deve ter no máximo 500 caracteres.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({ nome: nome.trim(), descricao: descricao.trim() });
    onClose();
  }

  const isEditar = mode === "editar";
  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className={styles.overlay} onClick={onClose} aria-modal="true" role="dialog" aria-label={isEditar ? "Editar projeto" : "Criar novo projeto"}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title} id="modal-title">
            {isEditar ? `Editar Projeto: ${projeto?.nome}` : "Criar Novo Projeto"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} title="Fechar" aria-label="Fechar modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Nome */}
          <div className={styles.field}>
            <label htmlFor="modal-nome" className={styles.label}>
              Nome do Projeto <span className={styles.required}>*</span>
            </label>
            <input
              id="modal-nome"
              ref={nomeRef}
              type="text"
              className={`${styles.input} ${errors.nome ? styles.inputError : ""}`}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={100}
              placeholder="Ex: TCC de Engenharia de Software"
            />
            {errors.nome && <span className={styles.errorMsg}>{errors.nome}</span>}
            <span className={styles.charCount}>{nome.length}/100</span>
          </div>

          {/* Descrição */}
          <div className={styles.field}>
            <label htmlFor="modal-descricao" className={styles.label}>
              Descrição <span className={styles.optional}>(opcional)</span>
            </label>
            <textarea
              id="modal-descricao"
              className={`${styles.textarea} ${errors.descricao ? styles.inputError : ""}`}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Descreva o projeto brevemente…"
            />
            {errors.descricao && <span className={styles.errorMsg}>{errors.descricao}</span>}
            <span className={styles.charCount}>{descricao.length}/500</span>
          </div>

          {/* Data de criação (só no criar) */}
          {!isEditar && (
            <div className={styles.field}>
              <label className={styles.label}>Data de criação</label>
              <div className={styles.readonlyField}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {dataAtual}
                <span className={styles.autoLabel}>gerado automaticamente</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button type="submit" id="btn-salvar-projeto" className={styles.saveBtn}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {isEditar ? "Salvar alterações" : "Salvar projeto"}
            </button>
            <button type="button" id="btn-cancelar-operacao" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Projeto, StatusProjeto } from "@/types/projeto";
import styles from "./ProjectFormModal.module.css";

export interface ProjectFormData {
  nome: string;
  descricao: string;
  status: StatusProjeto;
  capaUrl: string | null;
}

interface ProjectFormModalProps {
  mode: "criar" | "editar";
  projeto?: Projeto;
  onClose: () => void;
  onSave: (dados: ProjectFormData) => Promise<void> | void;
}

export default function ProjectFormModal({
  mode,
  projeto,
  onClose,
  onSave,
}: ProjectFormModalProps) {
  const [nome, setNome] = useState(projeto?.nomeProjeto ?? "");
  const [descricao, setDescricao] = useState(projeto?.descricao ?? "");
  const [status, setStatus] = useState<StatusProjeto>(projeto?.status ?? "ATIVO");
  const [capaUrl, setCapaUrl] = useState<string | null>(projeto?.capaUrl ?? null);
  const [errors, setErrors] = useState<{ nome?: string; descricao?: string }>({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const nomeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nomeRef.current?.focus();
  }, []);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      setSubmitError("");
      await onSave({
        nome: nome.trim(),
        descricao: descricao.trim(),
        status,
        capaUrl,
      });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Não foi possível salvar o projeto.");
    } finally {
      setSaving(false);
    }
  }

  function handleCover(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSubmitError("Escolha um arquivo de imagem.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSubmitError("A imagem deve ter no máximo 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setCapaUrl(String(reader.result));
    reader.readAsDataURL(file);
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
        <div className={styles.header}>
          <h2 className={styles.title} id="modal-title">
            {isEditar ? `Editar Projeto: ${projeto?.nomeProjeto}` : "Criar Novo Projeto"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} title="Fechar" aria-label="Fechar modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
              placeholder="Nome do projeto"
            />
            {errors.nome && <span className={styles.errorMsg}>{errors.nome}</span>}
            <span className={styles.charCount}>{nome.length}/100</span>
          </div>

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
              placeholder="Descrição do projeto"
            />
            {errors.descricao && <span className={styles.errorMsg}>{errors.descricao}</span>}
            <span className={styles.charCount}>{descricao.length}/500</span>
          </div>

          <div className={isEditar ? styles.inlineFields : styles.field}>
            {isEditar && (
              <div className={styles.field}>
                <label htmlFor="modal-status" className={styles.label}>
                  Status
                </label>
                <select
                  id="modal-status"
                  className={styles.input}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusProjeto)}
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="CONCLUIDO">Concluído</option>
                </select>
              </div>
            )}

            <div className={styles.field}>
              <span className={styles.label}>
                Capa <span className={styles.optional}>(opcional)</span>
              </span>
              <label className={styles.uploadBox} htmlFor="modal-capa">
                <span className={styles.uploadIcon}>+</span>
                <span>{capaUrl ? "Trocar imagem de capa" : "Adicionar imagem de capa"}</span>
                <small>PNG, JPG ou WEBP até 2MB</small>
              </label>
              <input
                id="modal-capa"
                type="file"
                className={styles.fileInput}
                accept="image/*"
                onChange={(e) => handleCover(e.target.files?.[0])}
              />
            </div>
          </div>

          {capaUrl && (
            <div className={styles.coverPreview}>
              <div style={{ backgroundImage: `url(${capaUrl})` }} />
              <button type="button" onClick={() => setCapaUrl(null)}>
                Remover capa
              </button>
            </div>
          )}

          {submitError && <span className={styles.errorMsg}>{submitError}</span>}

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

          <div className={styles.actions}>
            <button type="submit" id="btn-salvar-projeto" className={styles.saveBtn} disabled={saving}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {saving ? "Salvando..." : isEditar ? "Salvar alterações" : "Salvar projeto"}
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

"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import { MembroEquipe } from "@/types/equipe";
import styles from "./EventModal.module.css";

interface EventFormModalProps {
  projetoId?: number;
  dataPre?: string;
  onClose: () => void;
  onSave: (dados: {
    nome: string;
    data: string;
    descricao: string;
    membrosIds: number[];
  }) => void;
}

export default function EventFormModal({ projetoId, dataPre, onClose, onSave }: EventFormModalProps) {
  const [nome, setNome] = useState("");
  const [data, setData] = useState(dataPre || "");
  const [descricao, setDescricao] = useState("");
  const [membrosIds, setMembrosIds] = useState<number[]>([]);
  const [membros, setMembros] = useState<MembroEquipe[]>([]);
  const [loadingMembros, setLoadingMembros] = useState(true);
  const [errors, setErrors] = useState<{ nome?: string; data?: string; descricao?: string }>({});
  const nomeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nomeRef.current?.focus();
  }, []);

  useEffect(() => {
    async function carregarMembros() {
      if (!projetoId) {
        setLoadingMembros(false);
        return;
      }

      try {
        setLoadingMembros(true);
        const data = await apiFetch<MembroEquipe[]>(`/projetos/${projetoId}/membros`, {
          cache: "no-store",
        });
        setMembros(data);
      } catch {
        toast.error("Erro ao carregar membros do projeto");
        setMembros([]);
      } finally {
        setLoadingMembros(false);
      }
    }

    carregarMembros();
  }, [projetoId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function toggleMembro(id: number) {
    setMembrosIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (nome.trim().length === 0) {
      errs.nome = "O nome é obrigatório.";
    } else if (nome.trim().length > 100) {
      errs.nome = "O nome deve ter no máximo 100 caracteres.";
    }
    if (!data) {
      errs.data = "A data é obrigatória.";
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
    onSave({
      nome: nome.trim(),
      data,
      descricao: descricao.trim(),
      membrosIds,
    });
  }

  return (
    <div className={styles.overlay} onClick={onClose} aria-modal="true" role="dialog">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Adicionar Evento</h2>
          <button className={styles.closeBtn} onClick={onClose} title="Fechar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="evento-nome" className={styles.label}>
              Nome do Evento <span className={styles.required}>*</span>
            </label>
            <input
              id="evento-nome"
              ref={nomeRef}
              type="text"
              className={`${styles.input} ${errors.nome ? styles.inputError : ""}`}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={100}
              placeholder="Ex: Entrega do relatório"
            />
            {errors.nome && <span className={styles.errorMsg}>{errors.nome}</span>}
            <span className={styles.charCount}>{nome.length}/100</span>
          </div>

          <div className={styles.field}>
            <label htmlFor="evento-data" className={styles.label}>
              Data <span className={styles.required}>*</span>
            </label>
            <input
              id="evento-data"
              type="date"
              className={`${styles.input} ${errors.data ? styles.inputError : ""}`}
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
            {errors.data && <span className={styles.errorMsg}>{errors.data}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Membros <span className={styles.optional}>(opcional)</span>
            </label>
            {loadingMembros ? (
              <div className={styles.membrosGrid}>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>Carregando membros...</p>
              </div>
            ) : membros.length === 0 ? (
              <div className={styles.membrosGrid}>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                  Nenhum membro no projeto
                </p>
              </div>
            ) : (
              <div className={styles.membrosGrid}>
                {membros.map((m) => (
                  <label key={m.id} className={styles.membroCheckbox}>
                    <input
                      type="checkbox"
                      checked={membrosIds.includes(m.id || 0)}
                      onChange={() => toggleMembro(m.id || 0)}
                    />
                    <span className={styles.membroNome}>{m.nome && m.sobrenome ? `${m.nome} ${m.sobrenome}` : m.email}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="evento-descricao" className={styles.label}>
              Descrição <span className={styles.optional}>(opcional)</span>
            </label>
            <textarea
              id="evento-descricao"
              className={`${styles.textarea} ${errors.descricao ? styles.inputError : ""}`}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Descreva o evento brevemente…"
            />
            {errors.descricao && <span className={styles.errorMsg}>{errors.descricao}</span>}
            <span className={styles.charCount}>{descricao.length}/500</span>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Salvar
            </button>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

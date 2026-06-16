"use client";

import { useEffect, useRef, useState } from "react";
import { Evento } from "@/types/evento";
import { MembroEquipe } from "@/types/equipe";
import UserAvatar from "@/components/ui/UserAvatar";
import styles from "./EventModal.module.css";

const CORES_EVENTO = ["#2563eb", "#059669", "#d97706", "#dc2626", "#db2777", "#4338ca"];

interface EventEditModalProps {
  evento: Evento;
  membros: MembroEquipe[];
  onClose: () => void;
  onSave: (dados: {
    id: number;
    nome: string;
    data: string;
    descricao: string;
    cor: string;
    membrosIds: number[];
  }) => void;
  onDelete: () => void;
}

function nomeMembro(membro: MembroEquipe) {
  return [membro.nome, membro.sobrenome].filter(Boolean).join(" ") || membro.email;
}

function RemoveIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function EventEditModal({
  evento,
  membros,
  onClose,
  onSave,
  onDelete,
}: EventEditModalProps) {
  const [nome, setNome] = useState(evento.nome);
  const [data, setData] = useState(evento.data);
  const [descricao, setDescricao] = useState(evento.descricao ?? "");
  const [cor, setCor] = useState(evento.cor || CORES_EVENTO[0]);
  const [membrosIds, setMembrosIds] = useState<number[]>(
    evento.membros.map((m) => m.id)
  );
  const [errors, setErrors] = useState<{ nome?: string; data?: string; descricao?: string }>({});
  const nomeRef = useRef<HTMLInputElement>(null);
  const membrosDisponiveis = membros.filter((membro) => !membrosIds.includes(membro.id));
  const membrosSelecionados = membros.filter((membro) => membrosIds.includes(membro.id));

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
      id: evento.id,
      nome: nome.trim(),
      data,
      descricao: descricao.trim(),
      cor,
      membrosIds,
    });
  }

  return (
    <div className={styles.overlay} onClick={onClose} aria-modal="true" role="dialog">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Editar Evento</h2>
          <button className={styles.closeBtn} onClick={onClose} title="Fechar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="edit-evento-nome" className={styles.label}>
              Nome do Evento <span className={styles.required}>*</span>
            </label>
            <input
              id="edit-evento-nome"
              ref={nomeRef}
              type="text"
              className={`${styles.input} ${errors.nome ? styles.inputError : ""}`}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={100}
            />
            {errors.nome && <span className={styles.errorMsg}>{errors.nome}</span>}
            <span className={styles.charCount}>{nome.length}/100</span>
          </div>

          <div className={styles.field}>
            <label htmlFor="edit-evento-data" className={styles.label}>
              Data <span className={styles.required}>*</span>
            </label>
            <input
              id="edit-evento-data"
              type="date"
              className={`${styles.input} ${errors.data ? styles.inputError : ""}`}
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
            {errors.data && <span className={styles.errorMsg}>{errors.data}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Cor</label>
            <div className={styles.colorGrid}>
              {CORES_EVENTO.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`${styles.colorSwatch} ${cor === item ? styles.colorActive : ""}`}
                  style={{ backgroundColor: item }}
                  onClick={() => setCor(item)}
                  aria-label={`Selecionar cor ${item}`}
                />
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Atribuir Membros <span className={styles.optional}>(opcional)</span>
            </label>
            <div className={styles.membrosGrid}>
              {membros.length === 0 ? (
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                  Nenhum membro no projeto
                </p>
              ) : (
                <>
                {membrosDisponiveis.length > 0 && <small className={styles.popoverLabel}>Disponíveis</small>}
                {membrosDisponiveis.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={styles.memberOption}
                  onClick={() => toggleMembro(m.id)}
                >
                  <span><UserAvatar fotoUrl={m.fotoUrl} nome={m.nome ?? undefined} email={m.email} /></span>
                  <div>
                    <strong>{nomeMembro(m)}</strong>
                    <small>{m.email}</small>
                  </div>
                  <em>+</em>
                </button>
                ))}
                {membrosSelecionados.length > 0 && <small className={styles.popoverLabel}>Adicionados</small>}
                {membrosSelecionados.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={styles.memberOption}
                    onClick={() => toggleMembro(m.id)}
                  >
                    <span><UserAvatar fotoUrl={m.fotoUrl} nome={m.nome ?? undefined} email={m.email} /></span>
                    <div>
                      <strong>{nomeMembro(m)}</strong>
                      <small>{m.email}</small>
                    </div>
                    <em className={styles.removeMember}><RemoveIcon /></em>
                  </button>
                ))}
                </>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="edit-evento-descricao" className={styles.label}>
              Descrição <span className={styles.optional}>(opcional)</span>
            </label>
            <textarea
              id="edit-evento-descricao"
              className={`${styles.textarea} ${errors.descricao ? styles.inputError : ""}`}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              maxLength={500}
              rows={3}
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
            <button type="button" className={styles.deleteBtn} onClick={onDelete}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Excluir
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

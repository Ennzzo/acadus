"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Tarefa, StatusTarefa } from "@/types/tarefa";
import styles from "./ProjectTasks.module.css";

interface ProjectTasksProps {
  projetoId: number;
}

type TarefaForm = {
  nome: string;
  descricao: string;
  responsavel: string;
  prazo: string;
  progresso: number;
  comentario: string;
  checklist: string;
  anexo: string;
  status: StatusTarefa;
};

const statusLabel: Record<StatusTarefa, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  EM_VALIDACAO: "Em validação",
  APROVADA: "Aprovada",
  AJUSTES: "Ajustes",
};

const emptyForm: TarefaForm = {
  nome: "",
  descricao: "",
  responsavel: "",
  prazo: "",
  progresso: 0,
  comentario: "",
  checklist: "",
  anexo: "",
  status: "PENDENTE",
};

function formatDate(date?: string | null) {
  if (!date) return "Sem prazo";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function toForm(tarefa: Tarefa): TarefaForm {
  return {
    nome: tarefa.nome,
    descricao: tarefa.descricao ?? "",
    responsavel: tarefa.responsavel ?? "",
    prazo: tarefa.prazo ?? "",
    progresso: tarefa.progresso,
    comentario: tarefa.comentario ?? "",
    checklist: tarefa.checklist ?? "",
    anexo: tarefa.anexo ?? "",
    status: tarefa.status,
  };
}

export default function ProjectTasks({ projetoId }: ProjectTasksProps) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [editing, setEditing] = useState<Tarefa | null>(null);
  const [form, setForm] = useState<TarefaForm>(emptyForm);
  const modalOpen = editing !== null || form !== emptyForm;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiFetch<Tarefa[]>(`/projetos/${projetoId}/tarefas`, { cache: "no-store" });
        setTarefas(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar tarefas.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [projetoId]);

  function openNewTask() {
    setEditing(null);
    setForm({ ...emptyForm });
  }

  function openEditTask(tarefa: Tarefa) {
    setEditing(tarefa);
    setForm(toForm(tarefa));
  }

  function closeForm() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function saveTask(event: FormEvent) {
    event.preventDefault();
    setActionError("");

    const payload = {
      ...form,
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      responsavel: form.responsavel.trim() || null,
      prazo: form.prazo || null,
      comentario: form.comentario.trim() || null,
      checklist: form.checklist.trim() || null,
      anexo: form.anexo || null,
    };

    try {
      if (editing) {
        const updated = await apiFetch<Tarefa>(`/tarefas/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setTarefas((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await apiFetch<Tarefa>(`/projetos/${projetoId}/tarefas`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setTarefas((prev) => [...prev, created]);
      }

      closeForm();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível salvar a tarefa.");
    }
  }

  async function changeStatus(tarefa: Tarefa, status: StatusTarefa, progresso = tarefa.progresso) {
    try {
      setActionError("");
      const updated = await apiFetch<Tarefa>(`/tarefas/${tarefa.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nome: tarefa.nome,
          descricao: tarefa.descricao,
          responsavel: tarefa.responsavel,
          prazo: tarefa.prazo,
          comentario: tarefa.comentario,
          checklist: tarefa.checklist,
          anexo: tarefa.anexo,
          progresso,
          status,
        }),
      });

      setTarefas((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível atualizar a tarefa.");
    }
  }

  async function deleteTask(tarefa: Tarefa) {
    try {
      setActionError("");
      await apiFetch(`/tarefas/${tarefa.id}`, { method: "DELETE" });
      setTarefas((prev) => prev.filter((item) => item.id !== tarefa.id));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível excluir a tarefa.");
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Tarefas</h2>
          <p>{tarefas.length} {tarefas.length === 1 ? "tarefa cadastrada" : "tarefas cadastradas"}</p>
        </div>
        <button className={styles.primaryBtn} onClick={openNewTask}>Nova tarefa</button>
      </div>

      {loading && <p className={styles.message}>Carregando tarefas...</p>}
      {error && <p className={styles.message}>{error}</p>}
      {actionError && <p className={styles.errorMsg}>{actionError}</p>}

      {!loading && !error && tarefas.length === 0 && (
        <div className={styles.empty}>
          <h3>Nenhuma tarefa cadastrada</h3>
          <p>Crie a primeira tarefa para acompanhar o andamento do projeto.</p>
          <button className={styles.secondaryBtn} onClick={openNewTask}>Criar tarefa</button>
        </div>
      )}

      <div className={styles.list}>
        {tarefas.map((tarefa) => (
          <article key={tarefa.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div>
                <span className={`${styles.status} ${styles[tarefa.status]}`}>{statusLabel[tarefa.status]}</span>
                <h3>{tarefa.nome}</h3>
              </div>
              <button className={styles.textBtn} onClick={() => openEditTask(tarefa)}>Editar</button>
            </div>

            <p className={styles.description}>{tarefa.descricao || "Sem descrição."}</p>

            <div className={styles.meta}>
              <span>Responsável: {tarefa.responsavel || "Não definido"}</span>
              <span>Prazo: {formatDate(tarefa.prazo)}</span>
            </div>

            <div className={styles.progressRow}>
              <div className={styles.progressBar}>
                <span style={{ width: `${tarefa.progresso}%` }} />
              </div>
              <strong>{tarefa.progresso}%</strong>
            </div>

            {tarefa.comentario && <p className={styles.comment}>{tarefa.comentario}</p>}

            {tarefa.checklist && (
              <ul className={styles.checklist}>
                {tarefa.checklist.split("\n").filter(Boolean).map((item) => (
                  <li key={item}>
                    <input type="checkbox" checked={tarefa.status === "APROVADA"} readOnly />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {tarefa.anexo && <p className={styles.attachment}>Anexo: {tarefa.anexo}</p>}

            <div className={styles.actions}>
              <button onClick={() => changeStatus(tarefa, "EM_ANDAMENTO", Math.max(tarefa.progresso, 25))}>
                Iniciar
              </button>
              <button onClick={() => changeStatus(tarefa, "EM_VALIDACAO", 100)}>
                Enviar para validação
              </button>
              <button onClick={() => changeStatus(tarefa, "APROVADA", 100)}>
                Aprovar
              </button>
              <button onClick={() => changeStatus(tarefa, "AJUSTES")}>
                Solicitar ajustes
              </button>
              <button className={styles.dangerBtn} onClick={() => deleteTask(tarefa)}>
                Excluir
              </button>
            </div>
          </article>
        ))}
      </div>

      {modalOpen && (
        <div className={styles.overlay} onClick={closeForm}>
          <form className={styles.modal} onSubmit={saveTask} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editing ? "Editar tarefa" : "Nova tarefa"}</h2>
              <button type="button" onClick={closeForm}>Fechar</button>
            </div>

            <label>
              Nome
              <input
                value={form.nome}
                onChange={(event) => setForm({ ...form, nome: event.target.value })}
                minLength={3}
                maxLength={100}
                required
              />
            </label>

            <label>
              Descrição
              <textarea
                value={form.descricao}
                onChange={(event) => setForm({ ...form, descricao: event.target.value })}
                maxLength={500}
                rows={4}
              />
            </label>

            <div className={styles.formGrid}>
              <label>
                Responsável
                <input
                  value={form.responsavel}
                  onChange={(event) => setForm({ ...form, responsavel: event.target.value })}
                  maxLength={100}
                />
              </label>

              <label>
                Prazo
                <input
                  type="date"
                  value={form.prazo}
                  onChange={(event) => setForm({ ...form, prazo: event.target.value })}
                />
              </label>
            </div>

            <div className={styles.formGrid}>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as StatusTarefa })}
                >
                  {Object.entries(statusLabel).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>

              <label>
                Progresso
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.progresso}
                  onChange={(event) => setForm({ ...form, progresso: Number(event.target.value) })}
                />
              </label>
            </div>

            <label>
              Comentário
              <textarea
                value={form.comentario}
                onChange={(event) => setForm({ ...form, comentario: event.target.value })}
                maxLength={300}
                rows={3}
              />
            </label>

            <label>
              Checklist
              <textarea
                value={form.checklist}
                onChange={(event) => setForm({ ...form, checklist: event.target.value })}
                maxLength={1000}
                rows={4}
                placeholder="Um item por linha"
              />
            </label>

            <label>
              Anexo
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) {
                    event.target.value = "";
                    return;
                  }
                  setForm({ ...form, anexo: file.name });
                }}
              />
              {form.anexo && <span className={styles.fileName}>{form.anexo}</span>}
            </label>

            {actionError && <p className={styles.errorMsg}>{actionError}</p>}

            <div className={styles.modalActions}>
              <button type="button" className={styles.secondaryBtn} onClick={closeForm}>Cancelar</button>
              <button type="submit" className={styles.primaryBtn}>Salvar</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

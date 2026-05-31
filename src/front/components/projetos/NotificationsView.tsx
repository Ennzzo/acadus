"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, setSelectedProjectId, withUser } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { Notificacao } from "@/types/notificacao";
import { Projeto } from "@/types/projeto";
import styles from "./NotificationsView.module.css";

interface NotificationsViewProps {
  projetoId?: number;
}

const statusLabel = {
  PENDENTE: "Pendente",
  ACEITO: "Aceito",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
};

const typeLabel = {
  CONVITE: "Convite",
  CONVITE_RECUSADO: "Convite",
  LIDERANCA: "Liderança",
  TAREFA: "Tarefa",
  REMOCAO_EQUIPE: "Equipe",
  SAIDA_EQUIPE: "Equipe",
  MENSAGEM_PRIVADA: "Mensagem",
};

const READ_KEY = "acadus_notificacoes_lidas";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function notificationKey(item: Notificacao) {
  return `${item.tipo}-${item.referenciaId ?? "sem-id"}-${item.dataHora}`;
}

function readViewed() {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function NotificationsView({ projetoId }: NotificationsViewProps) {
  const [items, setItems] = useState<Notificacao[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [filter, setFilter] = useState<number | "TODOS">(projetoId ?? "TODOS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [details, setDetails] = useState<Notificacao | null>(null);
  const [viewed, setViewed] = useState<string[]>([]);

  const load = useCallback(async () => {
    const usuario = getCurrentUser();
    if (!usuario) {
      setError("Faça login para ver notificações.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [data, projects] = await Promise.all([
        apiFetch<Notificacao[]>(`/notificacoes?email=${encodeURIComponent(usuario.email)}`, {
          cache: "no-store",
        }),
        apiFetch<Projeto[]>(withUser("/projetos"), { cache: "no-store" }),
      ]);
      setProjetos(projects);
      setItems(projetoId ? data.filter((item) => item.projetoId === projetoId) : data);
      localStorage.setItem("acadus_notificacoes_vistas", String(data.length));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar notificações.");
    } finally {
      setLoading(false);
    }
  }, [projetoId]);

  useEffect(() => {
    const timer = window.setTimeout(() => setViewed(readViewed()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  async function answerInvite(id: number, status: "ACEITO" | "RECUSADO") {
    try {
      await apiFetch(withUser(`/equipe/membros/${id}/status`), {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      toast.success(status === "ACEITO" ? "Convite aceito." : "Convite recusado.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível responder ao convite.");
      await load();
    }
  }

  async function answerLeadership(id: number, action: "aceitar" | "recusar") {
    try {
      await apiFetch(withUser(`/equipe/membros/${id}/lideranca/${action}`), {
        method: "PUT",
      });
      toast.success(action === "aceitar" ? "Liderança aceita." : "Transferência recusada.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível responder à transferência.");
    }
  }

  const filtered = items.filter((item) => filter === "TODOS" || item.projetoId === filter);
  const projectName = (item: Notificacao) =>
    item.projetoNome || projetos.find((projeto) => projeto.id === item.projetoId)?.nomeProjeto || "Projeto";

  function markViewed(item: Notificacao) {
    const key = notificationKey(item);
    setViewed((current) => {
      if (current.includes(key)) return current;
      const next = [...current, key];
      localStorage.setItem(READ_KEY, JSON.stringify(next));
      return next;
    });
  }

  function openDetails(item: Notificacao) {
    markViewed(item);
    setDetails(item);
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Notificações</h2>
          <p>{filtered.length} {filtered.length === 1 ? "notificação" : "notificações"}</p>
        </div>
        <select value={filter} onChange={(event) => setFilter(event.target.value === "TODOS" ? "TODOS" : Number(event.target.value))}>
          <option value="TODOS">Todos os projetos</option>
          {projetos.map((projeto) => (
            <option key={projeto.id} value={projeto.id}>{projeto.nomeProjeto}</option>
          ))}
        </select>
      </div>

      {loading && <p className={styles.message}>Carregando notificações...</p>}
      {error && <p className={styles.message}>{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <div className={styles.empty}>
          <h3>Nada por aqui</h3>
          <p>Convites, tarefas e solicitações aparecem nesta área.</p>
        </div>
      )}

      <div className={styles.list}>
        {filtered.map((item, index) => {
          const isViewed = viewed.includes(notificationKey(item));
          return (
            <article
              key={`${item.tipo}-${item.referenciaId ?? item.dataHora}-${index}`}
              className={`${styles.card} ${styles.clickable} ${isViewed ? styles.readCard : ""}`}
              onClick={() => openDetails(item)}
            >
              <div className={styles.cardContent}>
                <div className={styles.titleRow}>
                  <h3>{item.titulo}</h3>
                  {item.status && <em className={`${styles.status} ${styles[item.status]}`}>{statusLabel[item.status]}</em>}
                </div>
                <p>{item.texto}</p>
                <small>{item.projetoId ? projectName(item) : "Conversa privada"}</small>
              </div>

              <div className={styles.cardAside}>
                <time className={styles.cardDate}>{formatDateTime(item.dataHora)}</time>
                <div
                  className={styles.actions}
                  onClick={(event) => {
                    event.stopPropagation();
                    markViewed(item);
                  }}
                >
                  {item.tipo === "CONVITE" && item.status === "PENDENTE" && item.referenciaId && (
                    <>
                      <button onClick={() => answerInvite(item.referenciaId!, "ACEITO")}>Aceitar</button>
                      <button onClick={() => answerInvite(item.referenciaId!, "RECUSADO")}>Recusar</button>
                    </>
                  )}

                  {item.tipo === "LIDERANCA" && item.status === "PENDENTE" && item.referenciaId && (
                    <>
                      <button onClick={() => answerLeadership(item.referenciaId!, "aceitar")}>Aceitar liderança</button>
                      <button onClick={() => answerLeadership(item.referenciaId!, "recusar")}>Recusar</button>
                    </>
                  )}

                  {item.tipo === "TAREFA" && item.projetoId && (
                    <Link href="/tarefas" onClick={() => setSelectedProjectId(item.projetoId!)}>
                      Abrir tarefas
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {details && (
        <div className={styles.overlay} onClick={() => setDetails(null)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span>{typeLabel[details.tipo]}</span>
                <h2>{details.titulo}</h2>
              </div>
              <button type="button" aria-label="Fechar" onClick={() => setDetails(null)}><CloseIcon /></button>
            </div>
            <dl>
              <div><dt>Projeto</dt><dd>{projectName(details)}</dd></div>
              {details.equipeNome && <div><dt>Equipe</dt><dd>{details.equipeNome}</dd></div>}
              {(details.remetenteNome || details.remetenteEmail) && (
                <div>
                  <dt>Enviado por</dt>
                  <dd>{details.remetenteNome || "Usuário"}</dd>
                  {details.remetenteEmail && <small>{details.remetenteEmail}</small>}
                </div>
              )}
              <div><dt>Data</dt><dd>{formatDateTime(details.dataHora)}</dd></div>
              {details.status && (
                <div>
                  <dt>Situação</dt>
                  <dd><em className={`${styles.status} ${styles[details.status]}`}>{statusLabel[details.status]}</em></dd>
                </div>
              )}
            </dl>
            {details.mensagem && (
              <div className={styles.inviteMessage}>
                <strong>Mensagem</strong>
                <p>{details.mensagem}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

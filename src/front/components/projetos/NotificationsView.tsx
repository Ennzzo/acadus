"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, setSelectedProjectId } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { Notificacao } from "@/types/notificacao";
import { Projeto } from "@/types/projeto";
import styles from "./NotificationsView.module.css";

interface NotificationsViewProps {
  projetoId?: number;
}

export default function NotificationsView({ projetoId }: NotificationsViewProps) {
  const [items, setItems] = useState<Notificacao[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [filter, setFilter] = useState<number | "TODOS">(projetoId ?? "TODOS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        apiFetch<Projeto[]>("/projetos", { cache: "no-store" }),
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
    const timer = window.setTimeout(() => {
      load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  async function answerInvite(id: number, status: "ACEITO" | "RECUSADO") {
    try {
      await apiFetch(`/equipe/membros/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      toast.success(status === "ACEITO" ? "Convite aceito." : "Convite recusado.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível responder ao convite.");
    }
  }

  async function answerLeadership(id: number, action: "aceitar" | "recusar") {
    try {
      await apiFetch(`/equipe/membros/${id}/lideranca/${action}`, {
        method: "PUT",
      });
      toast.success(action === "aceitar" ? "Liderança aceita." : "Transferência recusada.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível responder à transferência.");
    }
  }

  const filtered = items.filter((item) => filter === "TODOS" || item.projetoId === filter);
  const projectName = (id: number) => projetos.find((projeto) => projeto.id === id)?.nomeProjeto ?? `Projeto ${id}`;

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
        {filtered.map((item) => (
          <article key={`${item.tipo}-${item.referenciaId}`} className={styles.card}>
            <div>
              <span>{item.tipo === "CONVITE" ? "Convite" : item.tipo === "LIDERANCA" ? "Liderança" : "Tarefa"}</span>
              <small>{projectName(item.projetoId)}</small>
              <h3>{item.titulo}</h3>
              <p>{item.texto}</p>
            </div>

            <div className={styles.actions}>
              {item.tipo === "CONVITE" && (
                <>
                  <button onClick={() => answerInvite(item.referenciaId, "ACEITO")}>Aceitar</button>
                  <button onClick={() => answerInvite(item.referenciaId, "RECUSADO")}>Recusar</button>
                </>
              )}

              {item.tipo === "LIDERANCA" && (
                <>
                  <button onClick={() => answerLeadership(item.referenciaId, "aceitar")}>Aceitar liderança</button>
                  <button onClick={() => answerLeadership(item.referenciaId, "recusar")}>Recusar</button>
                </>
              )}

              {item.tipo === "TAREFA" && (
                <Link href="/tarefas" onClick={() => setSelectedProjectId(item.projetoId)}>
                  Abrir tarefas
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

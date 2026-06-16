"use client";

import { CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, setSelectedProjectId, withUser } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { Notificacao } from "@/types/notificacao";
import { Projeto } from "@/types/projeto";
import { Tarefa } from "@/types/tarefa";
import styles from "./DashboardInbox.module.css";

type ProjetoResumo = {
  projeto: Projeto;
  tarefas: Tarefa[];
};

const statusTarefa = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  EM_VALIDACAO: "Em validação",
  APROVADA: "Aprovada",
  AJUSTES: "Ajustes",
};

const statusProjeto = {
  ATIVO: "Ativo",
  CONCLUIDO: "Concluído",
};

function sameDay(value?: string | null) {
  if (!value) return false;
  const data = new Date(`${value}T00:00:00`);
  const hoje = new Date();
  return data.toDateString() === hoje.toDateString();
}

function isOverdue(tarefa: Tarefa) {
  if (!tarefa.prazo || tarefa.status === "APROVADA") return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return new Date(`${tarefa.prazo}T00:00:00`) < hoje;
}

function formatDate(value?: string | null) {
  if (!value) return "Sem prazo";
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value * 100) / total);
}

function avg(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function limitedText(value: string, size = 62) {
  if (value.length <= size) return value;
  return `${value.slice(0, size - 1)}...`;
}

function CardIcon({ type }: { type: "project" | "task" | "done" | "alert" }) {
  const path = {
    project: "M4 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z",
    task: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
    done: "m5 12 4 4L19 6",
    alert: "M12 9v4m0 4h.01M10.3 4.8 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0Z",
  };

  return (
    <span className={styles.icon}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={path[type]} />
      </svg>
    </span>
  );
}

export default function DashboardInbox() {
  const [projetos, setProjetos] = useState<ProjetoResumo[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const usuario = getCurrentUser();
    if (!usuario) {
      setError("Faça login para visualizar o dashboard.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const meusProjetos = await apiFetch<Projeto[]>(withUser("/projetos"), { cache: "no-store" });
      const tarefasPorProjeto = await Promise.all(
        meusProjetos.map(async (projeto) => {
          try {
            const tarefas = await apiFetch<Tarefa[]>(`/projetos/${projeto.id}/tarefas`, { cache: "no-store" });
            return { projeto, tarefas };
          } catch {
            return { projeto, tarefas: [] };
          }
        })
      );
      const avisos = await apiFetch<Notificacao[]>(`/notificacoes?email=${encodeURIComponent(usuario.email)}`, { cache: "no-store" });

      setProjetos(tarefasPorProjeto);
      setNotificacoes(avisos);
      setError("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível carregar o dashboard.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const dados = useMemo(() => {
    const tarefas = projetos.flatMap((item) => item.tarefas);
    const aprovadas = tarefas.filter((tarefa) => tarefa.status === "APROVADA").length;
    const validacao = tarefas.filter((tarefa) => tarefa.status === "EM_VALIDACAO").length;
    const ajustes = tarefas.filter((tarefa) => tarefa.status === "AJUSTES").length;
    const atrasadas = tarefas.filter(isOverdue).length;
    const hoje = tarefas.filter((tarefa) => sameDay(tarefa.prazo)).length;
    const progresso = percent(aprovadas, tarefas.length);
    const progressoMedio = avg(tarefas.map((tarefa) => tarefa.progresso || 0));

    const status = [
      { label: "Pendentes", value: tarefas.filter((tarefa) => tarefa.status === "PENDENTE").length },
      { label: "Em andamento", value: tarefas.filter((tarefa) => tarefa.status === "EM_ANDAMENTO").length },
      { label: "Validação", value: validacao },
      { label: "Aprovadas", value: aprovadas },
      { label: "Ajustes", value: ajustes },
    ];

    const porProjeto = projetos
      .map(({ projeto, tarefas: tarefasProjeto }) => {
        const feitas = tarefasProjeto.filter((tarefa) => tarefa.status === "APROVADA").length;
        return {
          projeto,
          total: tarefasProjeto.length,
          feitas,
          progresso: percent(feitas, tarefasProjeto.length),
          atrasadas: tarefasProjeto.filter(isOverdue).length,
        };
      })
      .sort((a, b) => b.total - a.total || a.projeto.nomeProjeto.localeCompare(b.projeto.nomeProjeto));

    const proximas = tarefas
      .filter((tarefa) => tarefa.status !== "APROVADA")
      .sort((a, b) => {
        const first = a.prazo ? new Date(`${a.prazo}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
        const second = b.prazo ? new Date(`${b.prazo}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
        return first - second;
      })
      .slice(0, 5);

    return {
      tarefas,
      aprovadas,
      validacao,
      ajustes,
      atrasadas,
      hoje,
      progresso,
      progressoMedio,
      status,
      porProjeto,
      proximas,
    };
  }, [projetos]);

  const maxStatus = Math.max(...dados.status.map((item) => item.value), 1);
  const recentNotifications = notificacoes.slice(0, 4);

  return (
    <div className={styles.wrapper}>
      <section className={styles.content}>
        <div className={styles.top}>
          <div>
            <h2>Dashboard</h2>
            <p>Visão geral dos seus projetos, tarefas e pendências.</p>
          </div>
          <Link href="/projetos" className={styles.primaryLink}>Novo projeto</Link>
        </div>

        {loading && <p className={styles.message}>Carregando indicadores...</p>}
        {error && <p className={styles.message}>{error}</p>}

        {!loading && !error && (
          <>
            <div className={styles.cards}>
              <article className={styles.stat}>
                <CardIcon type="project" />
                <span>Projetos</span>
                <strong>{projetos.length}</strong>
                <small>{projetos.filter((item) => item.projeto.status === "ATIVO").length} ativos</small>
              </article>
              <article className={styles.stat}>
                <CardIcon type="task" />
                <span>Tarefas</span>
                <strong>{dados.tarefas.length}</strong>
                <small>{dados.hoje} com prazo hoje</small>
              </article>
              <article className={styles.stat}>
                <CardIcon type="done" />
                <span>Progresso</span>
                <strong>{dados.progresso}%</strong>
                <small>{dados.aprovadas} tarefas aprovadas</small>
              </article>
              <article className={styles.stat}>
                <CardIcon type="alert" />
                <span>Atenção</span>
                <strong>{dados.atrasadas + dados.ajustes}</strong>
                <small>{dados.atrasadas} atrasadas, {dados.ajustes} em ajustes</small>
              </article>
            </div>

            {projetos.length === 0 ? (
              <div className={styles.empty}>
                <h3>Nenhum projeto encontrado</h3>
                <p>Crie ou aceite um convite para começar a acompanhar seus indicadores.</p>
                <Link href="/projetos">Ir para projetos</Link>
              </div>
            ) : (
              <div className={styles.grid}>
                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <div>
                      <h3>Tarefas por status</h3>
                      <p>Distribuição atual do quadro</p>
                    </div>
                    <span>{dados.progressoMedio}% média</span>
                  </div>
                  <div className={styles.bars}>
                    {dados.status.map((item) => (
                      <div className={styles.barItem} key={item.label}>
                        <span>{item.label}</span>
                        <div className={styles.barTrack}>
                          <div style={{ width: `${percent(item.value, maxStatus)}%` }} />
                        </div>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.progressPanel}>
                  <div className={styles.panelHeader}>
                    <div>
                      <h3>Progresso geral</h3>
                      <p>Baseado nas tarefas aprovadas</p>
                    </div>
                  </div>
                  <div className={styles.donut} style={{ "--progress": `${dados.progresso * 3.6}deg` } as CSSProperties}>
                    <span>{dados.progresso}%</span>
                    <small>concluído</small>
                  </div>
                  <div className={styles.legend}>
                    <span><i className={styles.doneDot} />{dados.aprovadas} aprovadas</span>
                    <span><i />{dados.tarefas.length - dados.aprovadas} abertas</span>
                  </div>
                </section>

                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <div>
                      <h3>Resumo dos projetos</h3>
                      <p>Projetos com maior movimento</p>
                    </div>
                  </div>
                  <div className={styles.table}>
                    {dados.porProjeto.slice(0, 5).map((item) => (
                      <Link
                        href={`/projetos/${item.projeto.id}`}
                        className={styles.projectRow}
                        key={item.projeto.id}
                        onClick={() => setSelectedProjectId(item.projeto.id)}
                      >
                        <span>{item.projeto.nomeProjeto}</span>
                        <small>{item.total} tarefas</small>
                        <em className={item.projeto.status === "CONCLUIDO" ? styles.green : styles.blue}>
                          {statusProjeto[item.projeto.status]}
                        </em>
                        <strong>{item.progresso}%</strong>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <div>
                      <h3>Próximas tarefas</h3>
                      <p>Prazos em aberto</p>
                    </div>
                    <Link href="/tarefas">Ver tarefas</Link>
                  </div>
                  <div className={styles.tasks}>
                    {dados.proximas.length === 0 ? (
                      <p className={styles.muted}>Nenhuma tarefa em aberto.</p>
                    ) : dados.proximas.map((tarefa) => (
                      <article className={styles.task} key={tarefa.id}>
                        <div>
                          <strong>{tarefa.nome}</strong>
                          <span>{formatDate(tarefa.prazo)}</span>
                        </div>
                        <em className={isOverdue(tarefa) ? styles.red : styles.blue}>{statusTarefa[tarefa.status]}</em>
                      </article>
                    ))}
                  </div>
                </section>

                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <div>
                      <h3>Atividades recentes</h3>
                      <p>Últimas notificações</p>
                    </div>
                    <Link href="/notificacoes">Ver todas</Link>
                  </div>
                  <div className={styles.notifications}>
                    {recentNotifications.length === 0 ? (
                      <p className={styles.muted}>Nenhuma notificação recente.</p>
                    ) : recentNotifications.map((item, index) => (
                      <article key={`${item.tipo}-${item.referenciaId ?? index}`} className={styles.notice}>
                        <strong>{item.titulo}</strong>
                        <p>{limitedText(item.texto)}</p>
                        <span>{formatDateTime(item.dataHora)}</span>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

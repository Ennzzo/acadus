"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Equipe, MembroEquipe, PapelMembro, StatusConvite } from "@/types/equipe";
import styles from "./ProjectTeam.module.css";

interface ProjectTeamProps {
  projetoId: number;
}

const papelLabel: Record<PapelMembro, string> = {
  LIDER: "Líder",
  MEMBRO: "Membro",
  OBSERVADOR: "Observador",
};

const statusLabel: Record<StatusConvite, string> = {
  PENDENTE: "Pendente",
  ACEITO: "Aceito",
  RECUSADO: "Recusado",
};

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export default function ProjectTeam({ projetoId }: ProjectTeamProps) {
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [nomeEquipe, setNomeEquipe] = useState("");
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState<PapelMembro>("MEMBRO");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiFetch<Equipe>(`/projetos/${projetoId}/equipe`, { cache: "no-store" });
        setEquipe(data);
        setNomeEquipe(data.nomeEquipe || `Equipe ${data.nomeProjeto}`);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar equipe.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [projetoId]);

  async function saveTeam(event: FormEvent) {
    event.preventDefault();
    try {
      setActionError("");
      const data = await apiFetch<Equipe>(`/projetos/${projetoId}/equipe`, {
        method: "PUT",
        body: JSON.stringify({ nomeEquipe: nomeEquipe.trim() }),
      });
      setEquipe(data);
      setNomeEquipe(data.nomeEquipe || "");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível salvar a equipe.");
    }
  }

  async function invite(event: FormEvent) {
    event.preventDefault();
    try {
      setActionError("");
      const membro = await apiFetch<MembroEquipe>(`/projetos/${projetoId}/equipe/membros`, {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          papel,
          mensagem: mensagem.trim() || null,
        }),
      });

      setEquipe((atual) => atual ? { ...atual, membros: [...atual.membros, membro] } : atual);
      setEmail("");
      setPapel("MEMBRO");
      setMensagem("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível convidar o membro.");
    }
  }

  async function changeStatus(membro: MembroEquipe, status: StatusConvite) {
    try {
      setActionError("");
      const updated = await apiFetch<MembroEquipe>(`/equipe/membros/${membro.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      setEquipe((atual) => atual
        ? { ...atual, membros: atual.membros.map((item) => item.id === updated.id ? updated : item) }
        : atual);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível atualizar o convite.");
    }
  }

  async function removeMember(membro: MembroEquipe) {
    try {
      setActionError("");
      await apiFetch(`/equipe/membros/${membro.id}`, { method: "DELETE" });
      setEquipe((atual) => atual
        ? { ...atual, membros: atual.membros.filter((item) => item.id !== membro.id) }
        : atual);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível remover o membro.");
    }
  }

  async function deleteTeam() {
    try {
      setActionError("");
      await apiFetch(`/projetos/${projetoId}/equipe`, { method: "DELETE" });
      setEquipe((atual) => atual ? { ...atual, nomeEquipe: null, membros: [] } : atual);
      setNomeEquipe(equipe ? `Equipe ${equipe.nomeProjeto}` : "");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível excluir a equipe.");
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Equipe</h2>
          <p>{equipe?.membros.length ?? 0} membros cadastrados</p>
        </div>
        <button className={styles.dangerBtn} onClick={deleteTeam} disabled={!equipe || loading}>
          Excluir equipe
        </button>
      </div>

      {loading && <p className={styles.message}>Carregando equipe...</p>}
      {error && <p className={styles.message}>{error}</p>}
      {actionError && <p className={styles.errorMsg}>{actionError}</p>}

      {!loading && !error && equipe && (
        <>
          <form className={styles.teamForm} onSubmit={saveTeam}>
            <label>
              Nome da equipe
              <input
                value={nomeEquipe}
                onChange={(event) => setNomeEquipe(event.target.value)}
                minLength={3}
                maxLength={100}
                required
              />
            </label>
            <button className={styles.primaryBtn} type="submit">Salvar equipe</button>
          </form>

          <form className={styles.inviteForm} onSubmit={invite}>
            <label>
              E-mail do membro
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={150}
                required
              />
            </label>

            <label>
              Papel
              <select value={papel} onChange={(event) => setPapel(event.target.value as PapelMembro)}>
                {Object.entries(papelLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label className={styles.messageField}>
              Mensagem
              <textarea
                value={mensagem}
                onChange={(event) => setMensagem(event.target.value)}
                maxLength={300}
                rows={3}
              />
            </label>

            <button className={styles.primaryBtn} type="submit">Convidar membro</button>
          </form>

          {equipe.membros.length === 0 ? (
            <div className={styles.empty}>
              <h3>Nenhum membro na equipe</h3>
              <p>Convide os participantes para organizar o trabalho do projeto.</p>
            </div>
          ) : (
            <div className={styles.list}>
              {equipe.membros.map((membro) => (
                <article key={membro.id} className={styles.member}>
                  <div>
                    <h3>{membro.email}</h3>
                    <p>{papelLabel[membro.papel]} · Convite em {formatDate(membro.dataConvite)}</p>
                    {membro.mensagem && <p className={styles.note}>{membro.mensagem}</p>}
                  </div>

                  <div className={styles.memberSide}>
                    <span className={`${styles.status} ${styles[membro.status]}`}>
                      {statusLabel[membro.status]}
                    </span>

                    <div className={styles.actions}>
                      <button onClick={() => changeStatus(membro, "ACEITO")}>Aceitar</button>
                      <button onClick={() => changeStatus(membro, "RECUSADO")}>Recusar</button>
                      <button className={styles.dangerBtn} onClick={() => removeMember(membro)}>
                        Remover
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

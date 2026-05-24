"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { Equipe, MembroEquipe, PapelMembro, StatusConvite } from "@/types/equipe";
import { Usuario } from "@/types/usuario";
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

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export default function ProjectTeam({ projetoId }: ProjectTeamProps) {
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [usuario] = useState<Usuario | null>(() => getCurrentUser());
  const [nomeEquipe, setNomeEquipe] = useState("");
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState<PapelMembro>("MEMBRO");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [removing, setRemoving] = useState<MembroEquipe | null>(null);
  const [confirmDeleteTeam, setConfirmDeleteTeam] = useState(false);
  const [motivo, setMotivo] = useState("");

  const loadTeam = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await apiFetch<Equipe>(`/projetos/${projetoId}/equipe`, { cache: "no-store" });
      setEquipe(data);
      setNomeEquipe(data.nomeEquipe || `Equipe ${data.nomeProjeto}`);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar equipe.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [projetoId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadTeam();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTeam]);

  const isLeader = Boolean(usuario?.email && (!equipe?.liderEmail || equipe.liderEmail === usuario.email));

  function updateMember(membro: MembroEquipe) {
    setEquipe((atual) => atual
      ? { ...atual, membros: atual.membros.map((item) => item.id === membro.id ? membro : item) }
      : atual);
  }

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
      toast.success("Equipe atualizada.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível salvar a equipe.";
      setActionError(message);
      toast.error(message);
    }
  }

  async function invite(event: FormEvent) {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!validEmail(cleanEmail)) {
      toast.error("Informe um e-mail válido.");
      return;
    }

    if (cleanEmail === usuario?.email.toLowerCase()) {
      toast.error("Você já é o líder deste projeto.");
      return;
    }

    try {
      setActionError("");
      const membro = await apiFetch<MembroEquipe>(`/projetos/${projetoId}/equipe/membros`, {
        method: "POST",
        body: JSON.stringify({
          email: cleanEmail,
          papel,
          mensagem: mensagem.trim() || null,
        }),
      });

      setEquipe((atual) => atual ? { ...atual, membros: [...atual.membros, membro] } : atual);
      setEmail("");
      setPapel("MEMBRO");
      setMensagem("");
      toast.success("Convite enviado.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível convidar o membro.";
      setActionError(message);
      toast.error(message);
    }
  }

  async function changeStatus(membro: MembroEquipe, status: StatusConvite) {
    try {
      setActionError("");
      const updated = await apiFetch<MembroEquipe>(`/equipe/membros/${membro.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      updateMember(updated);
      toast.success(status === "ACEITO" ? "Convite aceito." : "Convite recusado.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível atualizar o convite.";
      setActionError(message);
      toast.error(message);
    }
  }

  async function requestLeadership(membro: MembroEquipe) {
    try {
      setActionError("");
      const updated = await apiFetch<MembroEquipe>(`/equipe/membros/${membro.id}/lideranca`, {
        method: "PUT",
      });
      updateMember(updated);
      toast.success("Transferência enviada para aceite.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível transferir a liderança.";
      setActionError(message);
      toast.error(message);
    }
  }

  async function answerLeadership(membro: MembroEquipe, action: "aceitar" | "recusar") {
    try {
      setActionError("");
      await apiFetch<MembroEquipe>(`/equipe/membros/${membro.id}/lideranca/${action}`, {
        method: "PUT",
      });
      await loadTeam(false);
      toast.success(action === "aceitar" ? "Liderança aceita." : "Transferência recusada.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível responder a transferência.";
      setActionError(message);
      toast.error(message);
    }
  }

  async function removeMember(event: FormEvent) {
    event.preventDefault();
    if (!removing) return;

    try {
      setActionError("");
      await apiFetch(`/equipe/membros/${removing.id}`, { method: "DELETE" });
      setEquipe((atual) => atual
        ? { ...atual, membros: atual.membros.filter((item) => item.id !== removing.id) }
        : atual);
      setRemoving(null);
      setMotivo("");
      toast.success(removing.status === "PENDENTE" ? "Convite cancelado." : "Membro removido.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível remover o membro.";
      setActionError(message);
      toast.error(message);
    }
  }

  async function deleteTeam(event: FormEvent) {
    event.preventDefault();
    try {
      setActionError("");
      await apiFetch(`/projetos/${projetoId}/equipe`, { method: "DELETE" });
      setEquipe((atual) => atual ? { ...atual, nomeEquipe: null, membros: [] } : atual);
      setNomeEquipe(equipe ? `Equipe ${equipe.nomeProjeto}` : "");
      setConfirmDeleteTeam(false);
      toast.success("Equipe excluída.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível excluir a equipe.";
      setActionError(message);
      toast.error(message);
    }
  }

  function renderActions(membro: MembroEquipe) {
    const isCurrentUser = usuario?.email === membro.email;

    if (isCurrentUser && membro.status === "PENDENTE") {
      return (
        <>
          <button onClick={() => changeStatus(membro, "ACEITO")}>Aceitar</button>
          <button onClick={() => changeStatus(membro, "RECUSADO")}>Recusar</button>
        </>
      );
    }

    if (isCurrentUser && membro.transferenciaPendente) {
      return (
        <>
          <button onClick={() => answerLeadership(membro, "aceitar")}>Aceitar liderança</button>
          <button onClick={() => answerLeadership(membro, "recusar")}>Recusar</button>
        </>
      );
    }

    if (isLeader && membro.status === "PENDENTE") {
      return (
        <button className={styles.dangerBtn} onClick={() => setRemoving(membro)}>
          Cancelar convite
        </button>
      );
    }

    if (isLeader && membro.status === "ACEITO" && membro.papel !== "LIDER") {
      return (
        <>
          <button onClick={() => requestLeadership(membro)} disabled={membro.transferenciaPendente}>
            {membro.transferenciaPendente ? "Aguardando aceite" : "Transferir liderança"}
          </button>
          <button className={styles.dangerBtn} onClick={() => setRemoving(membro)}>
            Remover
          </button>
        </>
      );
    }

    return null;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Equipe</h2>
          <p>{equipe?.membros.length ?? 0} membros cadastrados</p>
        </div>
        {isLeader && (
          <button className={styles.dangerBtn} onClick={() => setConfirmDeleteTeam(true)} disabled={!equipe || loading}>
            Excluir equipe
          </button>
        )}
      </div>

      {loading && <p className={styles.message}>Carregando equipe...</p>}
      {error && <p className={styles.message}>{error}</p>}
      {actionError && <p className={styles.errorMsg}>{actionError}</p>}

      {!loading && !error && equipe && (
        <div className={styles.content}>
          {isLeader && (
            <aside className={styles.controls}>
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
                <label>
                  Projeto relacionado
                  <input value={equipe.nomeProjeto} readOnly />
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
                    <option value="MEMBRO">Membro</option>
                    <option value="OBSERVADOR">Observador</option>
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
            </aside>
          )}

          <section className={styles.membersPanel}>
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
                      {membro.transferenciaPendente && <p className={styles.note}>Transferência de liderança pendente</p>}
                    </div>

                    <div className={styles.memberSide}>
                      <span className={`${styles.status} ${styles[membro.status]}`}>
                        {statusLabel[membro.status]}
                      </span>

                      <div className={styles.actions}>
                        {renderActions(membro)}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {removing && (
        <div className={styles.overlay} onClick={() => setRemoving(null)}>
          <form className={styles.modal} onSubmit={removeMember} onClick={(event) => event.stopPropagation()}>
            <h2>Remover membro</h2>
            <p>{removing.email}</p>
            <label>
              Motivo da remoção
              <textarea
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
                rows={3}
              />
            </label>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setRemoving(null)}>Cancelar</button>
              <button type="submit" className={styles.dangerBtn}>Confirmar</button>
            </div>
          </form>
        </div>
      )}

      {confirmDeleteTeam && (
        <div className={styles.overlay} onClick={() => setConfirmDeleteTeam(false)}>
          <form className={styles.modal} onSubmit={deleteTeam} onClick={(event) => event.stopPropagation()}>
            <h2>Excluir equipe</h2>
            <p>Esta ação remove a equipe e os membros convidados deste projeto.</p>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setConfirmDeleteTeam(false)}>Cancelar</button>
              <button type="submit" className={styles.dangerBtn}>Confirmar</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

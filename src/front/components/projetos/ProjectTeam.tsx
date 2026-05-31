"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, withUser } from "@/lib/auth";
import { toast } from "@/lib/toast";
import UserAvatar from "@/components/ui/UserAvatar";
import { Equipe, MembroEquipe, PapelMembro, StatusConvite } from "@/types/equipe";
import { Usuario } from "@/types/usuario";
import styles from "./ProjectTeam.module.css";

interface ProjectTeamProps {
  projetoId: number;
}

const papelLabel: Record<PapelMembro, string> = {
  LIDER: "Líder",
  MEMBRO: "Membro",
};

function formatDate(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function sameEmail(first?: string | null, second?: string | null) {
  return Boolean(first && second && first.toLowerCase() === second.toLowerCase());
}

function memberName(membro: MembroEquipe) {
  return [membro.nome, membro.sobrenome].filter(Boolean).join(" ") || "Usuário convidado";
}

export default function ProjectTeam({ projetoId }: ProjectTeamProps) {
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [usuario] = useState<Usuario | null>(() => getCurrentUser());
  const [nomeEquipe, setNomeEquipe] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [removing, setRemoving] = useState<MembroEquipe | null>(null);
  const [reinviting, setReinviting] = useState<MembroEquipe | null>(null);
  const [confirmLeaveTeam, setConfirmLeaveTeam] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [reinviteMessage, setReinviteMessage] = useState("");

  const loadTeam = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await apiFetch<Equipe>(withUser(`/projetos/${projetoId}/equipe`), { cache: "no-store" });
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

  const isLeader = Boolean(usuario?.email && (!equipe?.liderEmail || sameEmail(equipe.liderEmail, usuario.email)));
  const latestMembers = useMemo(() => {
    const members = new Map<string, MembroEquipe>();

    for (const membro of equipe?.membros ?? []) {
      const key = membro.email.toLowerCase();
      const saved = members.get(key);
      if (!saved || membro.id > saved.id) members.set(key, membro);
    }

    return [...members.values()];
  }, [equipe?.membros]);
  const currentMember = latestMembers.find((membro) => sameEmail(membro.email, usuario?.email));
  const canLeave = currentMember?.status === "ACEITO" && !currentMember.dataSaida && currentMember.papel !== "LIDER";
  const activeMembers = latestMembers.filter((membro) => membro.status === "ACEITO" && !membro.dataSaida).length;
  const membros = useMemo(() => {
    return latestMembers
      .filter((membro) => !membro.ocultoLista)
      .sort((first, second) => {
      if (first.papel !== second.papel) return first.papel === "LIDER" ? -1 : 1;

      const firstIsUser = sameEmail(first.email, usuario?.email);
      const secondIsUser = sameEmail(second.email, usuario?.email);
      if (firstIsUser !== secondIsUser) return firstIsUser ? -1 : 1;

      return first.id - second.id;
    });
  }, [latestMembers, usuario?.email]);

  function updateMember(membro: MembroEquipe) {
    setEquipe((atual) => atual
      ? { ...atual, membros: atual.membros.map((item) => item.id === membro.id ? membro : item) }
      : atual);
  }

  function closeRemoval() {
    setRemoving(null);
    setMotivo("");
  }

  function closeReinvite() {
    setReinviting(null);
    setReinviteMessage("");
  }

  async function saveTeam(event: FormEvent) {
    event.preventDefault();
    try {
      setActionError("");
      const data = await apiFetch<Equipe>(withUser(`/projetos/${projetoId}/equipe`), {
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
      const membro = await apiFetch<MembroEquipe>(withUser(`/projetos/${projetoId}/equipe/membros`), {
        method: "POST",
        body: JSON.stringify({
          email: cleanEmail,
          mensagem: mensagem.trim() || null,
        }),
      });

      setEquipe((atual) => atual ? { ...atual, membros: [...atual.membros, membro] } : atual);
      setEmail("");
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
      const updated = await apiFetch<MembroEquipe>(withUser(`/equipe/membros/${membro.id}/status`), {
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
      const updated = await apiFetch<MembroEquipe>(withUser(`/equipe/membros/${membro.id}/lideranca`), {
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
      await apiFetch<MembroEquipe>(withUser(`/equipe/membros/${membro.id}/lideranca/${action}`), {
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
      await apiFetch(withUser(`/equipe/membros/${removing.id}`), {
        method: "DELETE",
        body: JSON.stringify({ mensagem: motivo.trim() || null }),
      });
      await loadTeam(false);
      closeRemoval();
      toast.success(removing.status === "PENDENTE" ? "Convite cancelado." : "Membro removido.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível remover o membro.";
      setActionError(message);
      toast.error(message);
    }
  }

  async function reinvite(event: FormEvent) {
    event.preventDefault();
    if (!reinviting) return;

    try {
      setActionError("");
      await apiFetch<MembroEquipe>(withUser(`/projetos/${projetoId}/equipe/membros`), {
        method: "POST",
        body: JSON.stringify({ email: reinviting.email, mensagem: reinviteMessage.trim() || null }),
      });
      await loadTeam(false);
      closeReinvite();
      toast.success("Novo convite enviado.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível enviar um novo convite.";
      setActionError(message);
      toast.error(message);
    }
  }

  async function hideMember(membro: MembroEquipe) {
    try {
      setActionError("");
      await apiFetch(withUser(`/equipe/membros/${membro.id}/lista`), { method: "DELETE" });
      await loadTeam(false);
      toast.success("Membro removido da lista.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível remover o membro da lista.";
      setActionError(message);
      toast.error(message);
    }
  }

  async function leaveTeam(event: FormEvent) {
    event.preventDefault();
    try {
      setActionError("");
      await apiFetch(withUser(`/projetos/${projetoId}/sair`), { method: "PUT" });
      await loadTeam(false);
      setConfirmLeaveTeam(false);
      toast.success("Você saiu da equipe.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível sair da equipe.";
      setActionError(message);
      toast.error(message);
    }
  }

  function renderActions(membro: MembroEquipe) {
    const isCurrentUser = sameEmail(usuario?.email, membro.email);

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

    if (isLeader && membro.status === "ACEITO" && !membro.dataSaida && membro.papel !== "LIDER") {
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

    if (isLeader && (membro.status === "RECUSADO" || membro.status === "CANCELADO" || Boolean(membro.dataSaida))) {
      return (
        <>
          <button onClick={() => setReinviting(membro)}>Convidar novamente</button>
          <button className={styles.dangerBtn} onClick={() => hideMember(membro)}>Remover da lista</button>
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
          <p>{activeMembers} membros ativos</p>
        </div>
        {canLeave && (
          <button className={styles.dangerBtn} onClick={() => setConfirmLeaveTeam(true)} disabled={!equipe || loading}>
            Sair da equipe
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
            {membros.length === 0 ? (
              <div className={styles.empty}>
                <h3>Nenhum membro na equipe</h3>
                <p>Convide os participantes para organizar o trabalho do projeto.</p>
              </div>
            ) : (
              <div className={styles.list}>
                {membros.map((membro) => (
                  <article key={membro.id} className={`${styles.member} ${membro.status === "RECUSADO" || membro.status === "CANCELADO" || membro.dataSaida ? styles.frozen : ""}`}>
                    <span className={styles.avatar}>
                      <UserAvatar fotoUrl={membro.fotoUrl} nome={membro.nome} email={membro.email} />
                    </span>
                    <div className={styles.memberInfo}>
                      <h3>
                        {memberName(membro)}
                        {sameEmail(membro.email, usuario?.email) && <span className={styles.self}> (Eu)</span>}
                      </h3>
                      <p>
                        {membro.email}
                        {membro.status === "PENDENTE" && ` · Convite em ${formatDate(membro.dataConvite)}`}
                        {membro.status === "RECUSADO" && ` · Convite recusado em ${formatDate(membro.dataConvite)}`}
                        {membro.status === "CANCELADO" && ` · Convite cancelado em ${formatDate(membro.dataConvite)}`}
                        {membro.status === "ACEITO" && !membro.dataSaida && ` · Entrou em ${formatDate(membro.dataEntrada || membro.dataConvite)}`}
                        {membro.dataSaida && ` · ${membro.removido ? "Removido" : "Saiu"} em ${formatDate(membro.dataSaida)}`}
                      </p>
                      {membro.transferenciaPendente && <p className={styles.note}>Transferência de liderança pendente</p>}
                    </div>

                    <div className={styles.memberSide}>
                      <span className={`${styles.role} ${membro.status === "RECUSADO" || membro.status === "CANCELADO" || membro.dataSaida ? styles.INATIVO : styles[membro.papel]}`}>
                        {membro.status === "RECUSADO" ? "Recusado" : membro.status === "CANCELADO" ? "Cancelado" : membro.dataSaida ? membro.removido ? "Removido" : "Saiu" : papelLabel[membro.papel]}
                      </span>
                    </div>
                    <div className={styles.actions}>
                      {renderActions(membro)}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {removing && (
        <div className={styles.overlay} onClick={closeRemoval}>
          <form className={styles.modal} onSubmit={removeMember} onClick={(event) => event.stopPropagation()}>
            <h2>{removing.status === "PENDENTE" ? "Cancelar convite" : "Remover membro"}</h2>
            <p>{removing.email}</p>
            <label>
              {removing.status === "PENDENTE" ? "Mensagem para o convidado" : "Mensagem para o membro"}
              <textarea
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
                maxLength={300}
                rows={3}
              />
            </label>
            <div className={styles.modalActions}>
              <button type="button" onClick={closeRemoval}>Cancelar</button>
              <button type="submit" className={styles.dangerBtn}>
                {removing.status === "PENDENTE" ? "Cancelar convite" : "Confirmar remoção"}
              </button>
            </div>
          </form>
        </div>
      )}

      {reinviting && (
        <div className={styles.overlay} onClick={closeReinvite}>
          <form className={styles.modal} onSubmit={reinvite} onClick={(event) => event.stopPropagation()}>
            <h2>Convidar novamente</h2>
            <p>{reinviting.email}</p>
            <label>
              Mensagem para o convite
              <textarea
                value={reinviteMessage}
                onChange={(event) => setReinviteMessage(event.target.value)}
                maxLength={300}
                rows={3}
              />
            </label>
            <div className={styles.modalActions}>
              <button type="button" onClick={closeReinvite}>Cancelar</button>
              <button type="submit" className={styles.primaryBtn}>Enviar convite</button>
            </div>
          </form>
        </div>
      )}

      {confirmLeaveTeam && (
        <div className={styles.overlay} onClick={() => setConfirmLeaveTeam(false)}>
          <form className={styles.modal} onSubmit={leaveTeam} onClick={(event) => event.stopPropagation()}>
            <h2>Sair da equipe</h2>
            <p>Você também deixará o projeto. Suas mensagens e tarefas continuarão salvas no histórico.</p>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setConfirmLeaveTeam(false)}>Cancelar</button>
              <button type="submit" className={styles.dangerBtn}>Sair da equipe</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch, apiFetchText } from "@/lib/api";
import { ConviteEquipe, Equipe, MembroEquipe, PapelEquipe, StatusEquipe } from "@/types/equipe";
import styles from "./styles.module.css";

interface ProjetoResumo {
  id: number;
  nome: string;
  descricao?: string | null;
  dataCriacao?: string;
}

interface ProjetoApiResponse {
  id?: number | string;
  nome?: string | null;
  nomeProjeto?: string | null;
  descricao?: string | null;
  dataCriacao?: string;
}

type ModalState =
  | { type: "none" }
  | { type: "criar" }
  | { type: "editar"; equipe: Equipe }
  | { type: "convidar"; equipe: Equipe }
  | { type: "gerenciar"; equipe: Equipe }
  | { type: "remover"; equipe: Equipe; membro: MembroEquipe }
  | { type: "excluir"; equipe: Equipe }
  | { type: "convite" };

const papelLabels: Record<PapelEquipe, string> = {
  LIDER: "Líder",
  MEMBRO: "Membro",
};

const statusLabels: Record<StatusEquipe, string> = {
  ATIVA: "Ativa",
  EXCLUIDA: "Excluída",
};

function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function memberDisplayName(membro: MembroEquipe) {
  return membro.nomeUsuario || [membro.nome, membro.sobrenome].filter(Boolean).join(" ") || membro.email || `Usuário ${membro.usuarioId ?? membro.id}`;
}

async function loadProjeto(id: string): Promise<ProjetoResumo | null> {
  try {
    const data = await apiFetch<ProjetoApiResponse>(`/projetos/${id}`, { cache: "no-store" });
    return {
      id: Number(data.id ?? id),
      nome: data.nomeProjeto ?? data.nome ?? "Projeto",
      descricao: data.descricao ?? null,
      dataCriacao: data.dataCriacao,
    };
  } catch {
    try {
      const data = await apiFetch<ProjetoApiResponse>(`/projetos/visualizar/${id}`, { cache: "no-store" });
      return {
        id: Number(data.id ?? id),
        nome: data.nome ?? "Projeto",
        descricao: data.descricao ?? null,
        dataCriacao: data.dataCriacao,
      };
    } catch {
      return null;
    }
  }
}

export default function EquipeProjetoPage() {
  const params = useParams<{ id: string }>();
  const projetoIdParam = params.id;
  const [projeto, setProjeto] = useState<ProjetoResumo | null>(null);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [equipeAtiva, setEquipeAtiva] = useState<Equipe | null>(null);
  const [membrosPorEquipe, setMembrosPorEquipe] = useState<Record<number, MembroEquipe[]>>({});
  const [convites, setConvites] = useState<ConviteEquipe[]>([]);
  const [loadId, setLoadId] = useState("");
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    loadProjeto(projetoIdParam).then(setProjeto);
  }, [projetoIdParam]);

  useEffect(() => {
    if (!equipeAtiva) return;

    let active = true;
    const equipeId = equipeAtiva.id;

    async function loadEquipeData() {
      try {
        const [membros, convitesData] = await Promise.all([
          apiFetch<MembroEquipe[]>(`/equipes/${equipeId}/membros`, { cache: "no-store" }),
          apiFetch<ConviteEquipe[]>(`/equipes/${equipeId}/convites`, { cache: "no-store" }),
        ]);

        if (active) {
          setMembrosPorEquipe((prev) => ({ ...prev, [equipeId]: membros }));
          setConvites(convitesData);
        }
      } catch {
        if (active) {
          setMembrosPorEquipe((prev) => ({ ...prev, [equipeId]: prev[equipeId] ?? [] }));
        }
      }
    }

    loadEquipeData();

    return () => {
      active = false;
    };
  }, [equipeAtiva]);

  const membrosAtivos = useMemo(() => {
    if (!equipeAtiva) return [];
    return membrosPorEquipe[equipeAtiva.id] ?? [];
  }, [equipeAtiva, membrosPorEquipe]);

  function showStatus(msg: string) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  }

  async function handleCriarEquipe(nome: string) {
    if (!projeto) return;
    const response = await apiFetch<Equipe>(
      `/equipes/criar/${encodeURIComponent(nome)}/${projeto.id}`,
      { method: "POST" }
    );

    if (response) {
      setEquipes((prev) => [...prev, response]);
      setEquipeAtiva(response);
      setMembrosPorEquipe((prev) => ({ ...prev, [response.id]: [] }));
      setConvites([]);
      showStatus("Equipe criada com sucesso.");
    } else {
      showStatus("Não foi possível criar a equipe.");
    }
  }

  async function handleEditarEquipe(equipe: Equipe, nome: string) {
    const ok = await apiFetch<boolean>(
      `/equipes/editar/${equipe.id}/${encodeURIComponent(nome)}`,
      { method: "PUT" }
    );

    if (ok) {
      setEquipes((prev) => prev.map((item) => (item.id === equipe.id ? { ...item, nome } : item)));
      setEquipeAtiva((prev) => (prev && prev.id === equipe.id ? { ...prev, nome } : prev));
      showStatus("Equipe atualizada.");
    } else {
      showStatus("Não foi possível editar a equipe.");
    }
  }

  async function handleExcluirEquipe(equipe: Equipe) {
    const ok = await apiFetch<boolean>(`/equipes/excluir/${equipe.id}`, { method: "PUT" });
    if (ok) {
      setEquipes((prev) => prev.filter((item) => item.id !== equipe.id));
      setEquipeAtiva((prev) => (prev?.id === equipe.id ? null : prev));
      setMembrosPorEquipe((prev) => {
        const clone = { ...prev };
        delete clone[equipe.id];
        return clone;
      });
      setConvites([]);
      showStatus("Equipe excluída.");
    } else {
      showStatus("Não foi possível excluir a equipe.");
    }
  }

  async function handleCarregarEquipe(id: string) {
    try {
      const equipe = await apiFetch<Equipe>(`/equipes/visualizar/${id}`, { cache: "no-store" });
      if (equipe) {
        setEquipes((prev) => (prev.some((item) => item.id === equipe.id) ? prev : [...prev, equipe]));
        setEquipeAtiva(equipe);
        showStatus("Equipe carregada.");
      } else {
        showStatus("Equipe não encontrada.");
      }
    } catch {
      showStatus("Equipe não encontrada.");
    }
  }

  async function handleAdicionarMembro(equipe: Equipe, usuarioId: number, papel: PapelEquipe) {
    const ok = await apiFetch<boolean>(
      `/membros/adicionar/${equipe.id}/${usuarioId}/${papel}`,
      { method: "POST" }
    );

    if (!ok) {
      showStatus("Não foi possível adicionar o membro.");
      return;
    }

    const nomeUsuario = await buscarNomeUsuario(usuarioId);
    setMembrosPorEquipe((prev) => {
      const list = prev[equipe.id] ?? [];
      const novo: MembroEquipe = {
        id: Date.now(),
        usuarioId,
        email: "",
        nomeUsuario: nomeUsuario ?? `Usuário ${usuarioId}`,
        papel,
        status: "ACEITO",
        dataConvite: new Date().toISOString(),
      };
      return { ...prev, [equipe.id]: [...list, novo] };
    });

    showStatus("Membro adicionado.");
  }

  async function handleRemoverMembro(equipe: Equipe, membro: MembroEquipe) {
    const ok = await apiFetch<boolean>(
      `/membros/remover/${equipe.id}/${membro.usuarioId}`,
      { method: "DELETE" }
    );

    if (ok) {
      setMembrosPorEquipe((prev) => {
        const list = prev[equipe.id] ?? [];
        return { ...prev, [equipe.id]: list.filter((item) => item.usuarioId !== membro.usuarioId) };
      });
      showStatus("Membro removido.");
    } else {
      showStatus("Não foi possível remover o membro.");
    }
  }

  async function handleEnviarConvite(equipe: Equipe, email: string, papel: PapelEquipe) {
    const ok = await apiFetch<boolean>(
      `/convites/enviar/${equipe.id}/${encodeURIComponent(email)}/${papel}`,
      { method: "POST" }
    );

    if (ok) {
      setConvites((prev) => [
        {
          id: Date.now(),
          emailConvidado: email,
          status: "PENDENTE",
          dataEnvio: new Date().toISOString(),
        },
        ...prev,
      ]);
      showStatus("Convite enviado.");
    } else {
      showStatus("Não foi possível enviar o convite.");
    }
  }

  async function handleRespostaConvite(idConvite: number, aceitar: boolean) {
    const path = aceitar ? "aceitar" : "recusar";
    const ok = await apiFetch<boolean>(`/convites/${path}/${idConvite}`, { method: "PUT" });
    if (ok) {
      setConvites((prev) => prev.map((c) => (c.id === idConvite ? { ...c, status: aceitar ? "ACEITO" : "RECUSADO" } : c)));
      showStatus("Resposta registrada.");
    } else {
      showStatus("Não foi possível atualizar o convite.");
    }
  }

  async function buscarNomeUsuario(usuarioId: number) {
    try {
      const data = await apiFetchText(`/usuarios/visualizar/${usuarioId}`, { cache: "no-store" });
      if (!data) return null;
      const match = data.match(/Usuário:\s*(.*)\s*\|/i);
      return match ? match[1] : data;
    } catch {
      return null;
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <div className={styles.hero}>
          <div>
            <h1 className={styles.heroTitle}>Gerenciamento de equipes</h1>
            <p className={styles.heroSubtitle}>
              {projeto ? `${projeto.nome} • projeto #${projeto.id}` : "Carregando projeto"}
            </p>
          </div>
          <div className={styles.heroActions}>
            <button className={styles.secondaryBtn} onClick={() => setModal({ type: "convite" })}>
              Responder convite
            </button>
            <button className={styles.primaryBtn} onClick={() => setModal({ type: "criar" })}>
              Criar equipe
            </button>
          </div>
        </div>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>Nossa equipe</h2>
            <ul className={styles.teamList}>
              {equipes.map((equipe) => (
                <li
                  key={equipe.id}
                  className={`${styles.teamItem} ${equipeAtiva?.id === equipe.id ? styles.teamItemActive : ""}`}
                  onClick={() => setEquipeAtiva(equipe)}
                >
                  <strong>{equipe.nome}</strong>
                  <span className={styles.teamMeta}>Status: {statusLabels[equipe.status ?? "ATIVA"]}</span>
                </li>
              ))}
            </ul>
            <div className={styles.loadTeam}>
              <label className={styles.modalLabel}>Carregar equipe pelo ID</label>
              <input
                className={styles.loadInput}
                value={loadId}
                onChange={(e) => setLoadId(e.target.value)}
                placeholder="Ex: 10"
              />
              <button
                className={styles.ghostBtn}
                onClick={() => loadId && handleCarregarEquipe(loadId)}
              >
                Carregar equipe
              </button>
            </div>
          </aside>

          <section className={styles.contentGrid}>
            <div className={`${styles.card} ${styles.cardWide}`}>
              <h3 className={styles.cardTitle}>Resumo do projeto</h3>
              <p className={styles.cardText}>{projeto?.descricao || "Sem descrição cadastrada."}</p>
              <div className={styles.badgeRow}>
                <span className={styles.badge}>ID do projeto: {projeto?.id ?? "-"}</span>
                <span className={styles.badge}>Equipe ativa: {equipeAtiva?.nome ?? "Nenhuma"}</span>
              </div>
              <div className={styles.placeholderBox}>Painel visual do projeto</div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Equipe</h3>
              {equipeAtiva ? (
                <>
                  <div className={styles.memberList}>
                    {membrosAtivos.length === 0 && (
                      <p className={styles.cardText}>Ainda não há membros adicionados.</p>
                    )}
                    {membrosAtivos.map((membro) => {
                      const nomeMembro = memberDisplayName(membro);
                      return (
                        <div key={membro.usuarioId ?? membro.id} className={styles.memberItem}>
                          <div className={styles.memberInfo}>
                            <span className={styles.avatar}>{initials(nomeMembro)}</span>
                            <div>
                              <div>{nomeMembro}</div>
                              <div className={styles.memberRole}>{papelLabels[membro.papel]}</div>
                            </div>
                          </div>
                          <button
                            className={styles.ghostBtn}
                            onClick={() => setModal({ type: "remover", equipe: equipeAtiva, membro })}
                          >
                            Remover
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button className={styles.secondaryBtn} onClick={() => setModal({ type: "gerenciar", equipe: equipeAtiva })}>
                    Gerenciar
                  </button>
                </>
              ) : (
                <p className={styles.cardText}>Selecione uma equipe para visualizar os membros.</p>
              )}
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Análises da equipe</h3>
              <div className={styles.placeholderBox}>Insights em breve</div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Prioridades</h3>
              <div className={styles.placeholderBox}>Planos e metas</div>
              <button className={styles.secondaryBtn}>Acessar prioridades</button>
            </div>

            <div className={`${styles.card} ${styles.cardWide}`}>
              <h3 className={styles.cardTitle}>Convites enviados</h3>
              {convites.length === 0 ? (
                <p className={styles.cardText}>Nenhum convite enviado ainda.</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {convites.map((convite) => (
                      <tr key={convite.id}>
                        <td>{convite.emailConvidado}</td>
                        <td>{convite.status}</td>
                        <td>{new Date(convite.dataEnvio).toLocaleDateString("pt-BR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>

        {statusMsg && <p className={styles.inlineHelp}>{statusMsg}</p>}
      </div>

      {modal.type === "criar" && (
        <EquipeFormModal
          title="Criar equipe"
          projetoId={projeto?.id ?? Number(projetoIdParam)}
          onClose={() => setModal({ type: "none" })}
          onSubmit={handleCriarEquipe}
        />
      )}

      {modal.type === "editar" && (
        <EquipeFormModal
          title="Editar equipe"
          projetoId={projeto?.id ?? Number(projetoIdParam)}
          initialNome={modal.equipe.nome}
          onClose={() => setModal({ type: "none" })}
          onSubmit={(nome) => handleEditarEquipe(modal.equipe, nome)}
        />
      )}

      {modal.type === "convidar" && (
        <ConviteModal
          equipe={modal.equipe}
          onClose={() => setModal({ type: "none" })}
          onSubmit={(email, papel) => handleEnviarConvite(modal.equipe, email, papel)}
        />
      )}

      {modal.type === "gerenciar" && (
        <GerenciarModal
          equipe={modal.equipe}
          membros={membrosAtivos}
          onClose={() => setModal({ type: "none" })}
          onAdicionar={handleAdicionarMembro}
          onEditar={() => setModal({ type: "editar", equipe: modal.equipe })}
          onConvidar={() => setModal({ type: "convidar", equipe: modal.equipe })}
          onExcluir={() => setModal({ type: "excluir", equipe: modal.equipe })}
        />
      )}

      {modal.type === "remover" && (
        <ConfirmModal
          title="Equipe"
          description={`Tem certeza que deseja remover o membro: ${modal.membro.nomeUsuario}?`}
          onClose={() => setModal({ type: "none" })}
          onConfirm={() => handleRemoverMembro(modal.equipe, modal.membro)}
        />
      )}

      {modal.type === "excluir" && (
        <ConfirmModal
          title="Excluir equipe"
          description={`Tem certeza que deseja excluir a equipe: ${modal.equipe.nome}?`}
          onClose={() => setModal({ type: "none" })}
          onConfirm={() => handleExcluirEquipe(modal.equipe)}
        />
      )}

      {modal.type === "convite" && (
        <RespostaConviteModal
          onClose={() => setModal({ type: "none" })}
          onSubmit={handleRespostaConvite}
        />
      )}
    </div>
  );
}

function EquipeFormModal({
  title,
  projetoId,
  initialNome = "",
  onClose,
  onSubmit,
}: {
  title: string;
  projetoId: number;
  initialNome?: string;
  onClose: () => void;
  onSubmit: (nome: string) => void;
}) {
  const [nome, setNome] = useState(initialNome);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    onSubmit(nome.trim());
    onClose();
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.ghostBtn} onClick={onClose}>Fechar</button>
        </div>
        <form className={styles.modalForm} onSubmit={handleSubmit}>
          <label className={styles.modalLabel}>Nome da equipe</label>
          <input
            className={styles.modalInput}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Squad Alpha"
          />
          <label className={styles.modalLabel}>Projeto relacionado</label>
          <input className={styles.modalInput} value={`Projeto #${projetoId}`} readOnly />
          <div className={styles.modalActions}>
            <button className={styles.secondaryBtn} type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className={styles.primaryBtn} type="submit">
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConviteModal({
  equipe,
  onClose,
  onSubmit,
}: {
  equipe: Equipe;
  onClose: () => void;
  onSubmit: (email: string, papel: PapelEquipe) => void;
}) {
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState<PapelEquipe>("MEMBRO");
  const [mensagem, setMensagem] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    onSubmit(email.trim(), papel);
    setMensagem("");
    onClose();
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Convidar membros</h2>
          <button className={styles.ghostBtn} onClick={onClose}>Fechar</button>
        </div>
        <form className={styles.modalForm} onSubmit={handleSubmit}>
          <label className={styles.modalLabel}>Equipe selecionada</label>
          <input className={styles.modalInput} value={equipe.nome} readOnly />
          <label className={styles.modalLabel}>E-mail do membro</label>
          <input
            className={styles.modalInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@exemplo.com"
          />
          <label className={styles.modalLabel}>Papel sugerido</label>
          <select className={styles.modalSelect} value={papel} onChange={(e) => setPapel(e.target.value as PapelEquipe)}>
            <option value="MEMBRO">Membro</option>
            <option value="LIDER">Líder</option>
          </select>
          <label className={styles.modalLabel}>Mensagem do convite</label>
          <textarea
            className={styles.modalTextarea}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Mensagem opcional para o membro"
          />
          <span className={styles.inlineHelp}>Mensagem não é enviada pelo back atual, mas fica registrada aqui para contexto.</span>
          <div className={styles.modalActions}>
            <button className={styles.secondaryBtn} type="button" onClick={onClose}>
              Voltar
            </button>
            <button className={styles.primaryBtn} type="submit">
              Enviar convite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GerenciarModal({
  equipe,
  membros,
  onClose,
  onAdicionar,
  onEditar,
  onConvidar,
  onExcluir,
}: {
  equipe: Equipe;
  membros: MembroEquipe[];
  onClose: () => void;
  onAdicionar: (equipe: Equipe, usuarioId: number, papel: PapelEquipe) => void;
  onEditar: () => void;
  onConvidar: () => void;
  onExcluir: () => void;
}) {
  const [usuarioId, setUsuarioId] = useState("");
  const [papel, setPapel] = useState<PapelEquipe>("MEMBRO");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!usuarioId.trim()) return;
    onAdicionar(equipe, Number(usuarioId), papel);
    setUsuarioId("");
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Membros</h2>
          <button className={styles.ghostBtn} onClick={onClose}>Fechar</button>
        </div>
        <form className={styles.modalForm} onSubmit={handleAdd}>
          <label className={styles.modalLabel}>Adicionar usuário por ID</label>
          <input
            className={styles.modalInput}
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
            placeholder="Ex: 12"
          />
          <label className={styles.modalLabel}>Papel</label>
          <select className={styles.modalSelect} value={papel} onChange={(e) => setPapel(e.target.value as PapelEquipe)}>
            <option value="MEMBRO">Membro</option>
            <option value="LIDER">Líder</option>
          </select>
          <button className={styles.primaryBtn} type="submit">Adicionar</button>
        </form>

        <div className={styles.inlineHelp} style={{ marginTop: "1rem" }}>
          Total de membros: {membros.length}
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Papel</th>
            </tr>
          </thead>
          <tbody>
            {membros.map((membro) => (
              <tr key={membro.usuarioId}>
                <td>{membro.nomeUsuario}</td>
                <td>{papelLabels[membro.papel]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.modalActions}>
          <button className={styles.secondaryBtn} type="button" onClick={onEditar}>
            Editar equipe
          </button>
          <button className={styles.secondaryBtn} type="button" onClick={onConvidar}>
            Convidar
          </button>
          <button className={styles.ghostBtn} type="button" onClick={onExcluir}>
            Excluir equipe
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  description,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.ghostBtn} onClick={onClose}>Fechar</button>
        </div>
        <p className={styles.cardText}>{description}</p>
        <div className={styles.modalActions}>
          <button className={styles.secondaryBtn} onClick={onClose}>Cancelar</button>
          <button className={styles.primaryBtn} onClick={() => { onConfirm(); onClose(); }}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

function RespostaConviteModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (id: number, aceitar: boolean) => void;
}) {
  const [idConvite, setIdConvite] = useState("");

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Equipe</h2>
          <button className={styles.ghostBtn} onClick={onClose}>Fechar</button>
        </div>
        <div className={styles.modalForm}>
          <label className={styles.modalLabel}>ID do convite</label>
          <input
            className={styles.modalInput}
            value={idConvite}
            onChange={(e) => setIdConvite(e.target.value)}
            placeholder="Ex: 101"
          />
          <div className={styles.modalActions}>
            <button
              className={styles.secondaryBtn}
              onClick={() => { if (idConvite) onSubmit(Number(idConvite), true); onClose(); }}
            >
              Aceitar
            </button>
            <button
              className={styles.ghostBtn}
              onClick={() => { if (idConvite) onSubmit(Number(idConvite), false); onClose(); }}
            >
              Recusar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

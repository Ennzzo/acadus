"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, withUser } from "@/lib/auth";
import { toast } from "@/lib/toast";
import UserAvatar from "@/components/ui/UserAvatar";
import { ChatContato, ChatMensagem, ChatProjeto } from "@/types/chat";
import { Equipe, MembroEquipe } from "@/types/equipe";
import { Usuario } from "@/types/usuario";
import styles from "./ProjectChat.module.css";

interface ProjectChatProps {
  projetoId?: number;
}

interface ChatFile {
  nome: string;
  tipo: string;
  mime: string;
  data: string;
}

type ChatItem =
  | { type: "equipe"; projeto: ChatProjeto }
  | { type: "privado"; contato: ChatContato };

type ChatSelection =
  | { type: "equipe"; id: number }
  | { type: "privado"; email: string };

function formatTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fileType(name: string) {
  const ext = name.split(".").pop();
  return ext ? ext.toUpperCase() : "ARQ";
}

function parseFile(value: string): ChatFile {
  try {
    const file = JSON.parse(value) as ChatFile;
    if (file.nome && file.data) return file;
  } catch {}

  return {
    nome: value,
    tipo: fileType(value),
    mime: "text/plain",
    data: URL.createObjectURL(new Blob([value], { type: "text/plain" })),
  };
}

function parseFiles(value: string): ChatFile[] {
  try {
    const data = JSON.parse(value) as ChatFile[] | ChatFile;
    if (Array.isArray(data)) return data.filter((file) => file.nome && file.data);
    if (data.nome && data.data) return [data];
  } catch {}

  return [parseFile(value)];
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(JSON.stringify({
      nome: file.name,
      tipo: fileType(file.name),
      mime: file.type || "application/octet-stream",
      data: String(reader.result),
    }));
    reader.onerror = () => reject(new Error("Não foi possível ler o anexo."));
    reader.readAsDataURL(file);
  });
}

async function openFile(data: string) {
  const blob = await fetch(data).then((response) => response.blob());
  window.open(URL.createObjectURL(blob), "_blank");
}

function resizeTextarea(element: HTMLTextAreaElement) {
  element.style.height = "auto";
  element.style.height = `${Math.min(element.scrollHeight, 144)}px`;
}

function chatKey(selection: ChatSelection) {
  return selection.type === "equipe" ? `equipe:${selection.id}` : `privado:${selection.email.toLowerCase()}`;
}

function selectionKey(email: string) {
  return `acadus_chat_aberto_${email}`;
}

function draftKey(email: string, selection: ChatSelection) {
  return `acadus_chat_rascunho_${email}_${chatKey(selection)}`;
}

function readSelection(email: string): ChatSelection | null {
  try {
    return JSON.parse(sessionStorage.getItem(selectionKey(email)) || "null") as ChatSelection | null;
  } catch {
    return null;
  }
}

function saveSelection(email: string, selection: ChatSelection) {
  sessionStorage.setItem(selectionKey(email), JSON.stringify(selection));
}

function clearSelection(email: string) {
  sessionStorage.removeItem(selectionKey(email));
}

function readDraft(email: string, selection: ChatSelection) {
  return sessionStorage.getItem(draftKey(email, selection)) || "";
}

function saveDraft(email: string, selection: ChatSelection, value: string) {
  if (value) sessionStorage.setItem(draftKey(email, selection), value);
  else sessionStorage.removeItem(draftKey(email, selection));
}

function sortChats(projetos: ChatProjeto[], contatos: ChatContato[]): ChatItem[] {
  return [
    ...projetos.map((projeto): ChatItem => ({ type: "equipe", projeto })),
    ...contatos.map((contato): ChatItem => ({ type: "privado", contato })),
  ].sort((a, b) => {
    const first = a.type === "equipe" ? a.projeto.ultimaMensagem : a.contato.ultimaMensagem;
    const second = b.type === "equipe" ? b.projeto.ultimaMensagem : b.contato.ultimaMensagem;
    return new Date(second || 0).getTime() - new Date(first || 0).getTime();
  });
}

function contactName(contact: Pick<ChatContato, "email" | "nome" | "sobrenome">) {
  return [contact.nome, contact.sobrenome].filter(Boolean).join(" ") || contact.email;
}

function messagePreview(value: string) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > 58 ? `${text.slice(0, 58)}...` : text;
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export default function ProjectChat({ projetoId }: ProjectChatProps) {
  const [usuario] = useState<Usuario | null>(() => getCurrentUser());
  const [projetos, setProjetos] = useState<ChatProjeto[]>([]);
  const [contatos, setContatos] = useState<ChatContato[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(projetoId ?? null);
  const [privateContact, setPrivateContact] = useState<ChatContato | null>(null);
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [mensagens, setMensagens] = useState<ChatMensagem[]>([]);
  const [conteudo, setConteudo] = useState("");
  const [anexos, setAnexos] = useState<string[]>([]);
  const [editing, setEditing] = useState<ChatMensagem | null>(null);
  const [editText, setEditText] = useState("");
  const [editAnexo, setEditAnexo] = useState("");
  const [deleting, setDeleting] = useState<ChatMensagem | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatEmail, setNewChatEmail] = useState("");
  const [newChatError, setNewChatError] = useState("");
  const [confirmDeleteChat, setConfirmDeleteChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadLists() {
      if (!usuario) {
        setError("Faça login para acessar os chats.");
        setLoading(false);
        return;
      }

      const [teamChats, privateChats] = await Promise.all([
        apiFetch<ChatProjeto[]>(withUser("/chats"), { cache: "no-store" }),
        apiFetch<ChatContato[]>(withUser("/chats/privados"), { cache: "no-store" }),
      ]);
      const teams = teamChats;
      let contacts = privateChats;
      const saved = readSelection(usuario.email);
      const selectedTeam = projetoId ? teams.find((item) => item.id === projetoId) : null;
      let initial: ChatSelection | null = selectedTeam
        ? { type: "equipe", id: selectedTeam.id }
        : null;

      if (!initial && saved?.type === "equipe" && teams.some((item) => item.id === saved.id)) {
        initial = saved;
      } else if (!initial && saved?.type === "privado") {
        let contact = contacts.find((item) => item.email.toLowerCase() === saved.email.toLowerCase()) ?? null;
        const draft = readDraft(usuario.email, saved);
        if (!contact && draft) {
          try {
            contact = await apiFetch<ChatContato>(`/chats/usuarios?email=${encodeURIComponent(saved.email)}`);
            contacts = [contact, ...contacts];
          } catch {}
        }

        if (contact) {
          initial = saved;
        }
      }

      if (!initial) {
        clearSelection(usuario.email);
        const first = sortChats(teams, contacts)[0];
        if (first?.type === "equipe") {
          initial = { type: "equipe", id: first.projeto.id };
        } else if (first?.type === "privado") {
          initial = { type: "privado", email: first.contato.email };
        }
      }

      setProjetos(teams);
      setContatos(contacts);
      if (initial?.type === "equipe") {
        setSelectedProject(initial.id);
        setPrivateContact(null);
        setConteudo(readDraft(usuario.email, initial));
        saveSelection(usuario.email, initial);
      } else if (initial?.type === "privado") {
        setSelectedProject(null);
        setPrivateContact(contacts.find((item) => item.email.toLowerCase() === initial.email.toLowerCase()) ?? null);
        setConteudo(readDraft(usuario.email, initial));
        saveSelection(usuario.email, initial);
      } else {
        setSelectedProject(null);
        setPrivateContact(null);
      }
      setLoading(false);
    }

    loadLists().catch((err) => {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os chats.");
      setLoading(false);
    });
  }, [projetoId, usuario]);

  useEffect(() => {
    async function loadChat() {
      if (!usuario) return;

      try {
        setLoading(true);
        if (privateContact) {
          const messages = await apiFetch<ChatMensagem[]>(
            withUser(`/chat/privado?destinatario=${encodeURIComponent(privateContact.email)}`),
            { cache: "no-store" },
          );
          setMensagens(messages);
          setEquipe(null);
          apiFetch(withUser(`/chat/privado/leitura?destinatario=${encodeURIComponent(privateContact.email)}`), {
            method: "PUT",
          }).then(() => {
            setContatos((items) => items.map((item) => item.email === privateContact.email
              ? { ...item, naoVisualizada: false }
              : item));
            window.dispatchEvent(new Event("acadus-chat-read"));
          }).catch(() => {});
        } else if (selectedProject) {
          const [messages, team] = await Promise.all([
            apiFetch<ChatMensagem[]>(withUser(`/projetos/${selectedProject}/chat?tipo=EQUIPE`), { cache: "no-store" }),
            apiFetch<Equipe>(withUser(`/projetos/${selectedProject}/equipe`), { cache: "no-store" }),
          ]);
          setMensagens(messages);
          setEquipe(team);
          apiFetch(withUser(`/projetos/${selectedProject}/chat/leitura`), { method: "PUT" }).then(() => {
            setProjetos((items) => items.map((item) => item.id === selectedProject
              ? { ...item, naoVisualizada: false }
              : item));
            window.dispatchEvent(new Event("acadus-chat-read"));
          }).catch(() => {});
        } else {
          setMensagens([]);
          setEquipe(null);
        }
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível carregar o chat.");
      } finally {
        setLoading(false);
      }
    }

    loadChat();
  }, [privateContact, selectedProject, usuario]);

  const projeto = useMemo(
    () => projetos.find((item) => item.id === selectedProject) ?? null,
    [projetos, selectedProject],
  );
  const membrosAtuais = useMemo(() => {
    const members = new Map<string, MembroEquipe>();

    for (const membro of equipe?.membros ?? []) {
      const key = membro.email.toLowerCase();
      const saved = members.get(key);
      if (!saved || membro.id > saved.id) members.set(key, membro);
    }

    return [...members.values()];
  }, [equipe?.membros]);
  const participantes = membrosAtuais.filter((membro) => membro.status === "ACEITO" && !membro.dataSaida);
  const frozen = Boolean(!privateContact && projeto?.statusMembro === "SAIU");
  const isLeader = projeto?.liderEmail === usuario?.email;
  const hasChat = Boolean(privateContact || selectedProject);
  const title = privateContact ? contactName(privateContact) : projeto?.nomeProjeto ?? "Chats";
  const chatItems = useMemo(() => sortChats(projetos, contatos), [projetos, contatos]);
  const feedItems = useMemo(() => {
    const items: Array<
      | { type: "mensagem"; date: string; mensagem: ChatMensagem }
      | { type: "entrada"; date: string; membro: MembroEquipe }
      | { type: "saida"; date: string; membro: MembroEquipe }
    > = mensagens.map((mensagem) => ({ type: "mensagem", date: mensagem.dataHora, mensagem }));

    if (!privateContact) {
      const vinculos = equipe?.membros.filter((membro) =>
        membro.status === "ACEITO" && membro.email.toLowerCase() === usuario?.email.toLowerCase()) ?? [];
      const dataEntrada = (membro: MembroEquipe) => {
        const previousExit = equipe?.membros
          .filter((item) => item.id < membro.id && item.email.toLowerCase() === membro.email.toLowerCase() && item.dataSaida)
          .map((item) => item.dataSaida as string)
          .sort()
          .at(-1);
        const date = membro.dataEntrada || membro.dataConvite;
        const legacyDate = /^\d{4}-\d{2}-\d{2}(?:T00:00:00(?:\.0+)?)?$/.test(date);
        return legacyDate && previousExit
          ? new Date(new Date(previousExit).getTime() + 1).toISOString()
          : date;
      };
      const visivel = (date: string) => {
        if (projeto?.visivelDesde && new Date(date) <= new Date(projeto.visivelDesde)) return false;
        return vinculos.some((vinculo) => {
          const entrada = new Date(dataEntrada(vinculo));
          return new Date(date) >= entrada && (!vinculo.dataSaida || new Date(date) <= new Date(vinculo.dataSaida));
        });
      };

      for (const membro of equipe?.membros ?? []) {
        if (membro.status === "ACEITO" && membro.dataEntrada) {
          const date = dataEntrada(membro);
          if (visivel(date)) items.push({ type: "entrada", date, membro });
        }
        if (membro.dataSaida && visivel(membro.dataSaida)) {
          items.push({ type: "saida", date: membro.dataSaida, membro });
        }
      }
    }

    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [equipe, mensagens, privateContact, projeto, usuario?.email]);

  useEffect(() => {
    if (!loading && hasChat && !frozen) {
      textareaRef.current?.focus();
    }
  }, [frozen, hasChat, loading, privateContact, selectedProject]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [feedItems]);

  function selectProject(id: number) {
    const selection: ChatSelection = { type: "equipe", id };
    setSelectedProject(id);
    setPrivateContact(null);
    setConteudo(usuario ? readDraft(usuario.email, selection) : "");
    setAnexos([]);
    setMenuOpen(false);
    if (usuario) saveSelection(usuario.email, selection);
  }

  function selectPrivate(contact: ChatContato) {
    const selection: ChatSelection = { type: "privado", email: contact.email };
    setPrivateContact(contact);
    setSelectedProject(null);
    setConteudo(usuario ? readDraft(usuario.email, selection) : "");
    setAnexos([]);
    setMenuOpen(false);
    if (!contatos.some((item) => item.email === contact.email)) {
      setContatos((items) => [contact, ...items]);
    }
    if (usuario) saveSelection(usuario.email, selection);
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!usuario || (!privateContact && !selectedProject) || (!conteudo.trim() && anexos.length === 0)) return;

    try {
      const path = privateContact
        ? withUser(`/chat/privado?destinatario=${encodeURIComponent(privateContact.email)}`)
        : withUser(`/projetos/${selectedProject}/chat`);
      const created = await apiFetch<ChatMensagem>(path, {
        method: "POST",
        body: JSON.stringify({
          autorEmail: usuario.email,
          autorNome: `${usuario.nome} ${usuario.sobrenome}`.trim(),
          tipoChat: privateContact ? "PRIVADO" : "EQUIPE",
          conteudo: conteudo.trim() || "Anexo enviado.",
          anexo: anexos.length > 0 ? JSON.stringify(anexos.map((item) => parseFile(item))) : null,
        }),
      });
      setMensagens((items) => [...items, created]);
      if (privateContact) {
        setContatos((items) => items.map((item) => item.email === privateContact.email
          ? { ...item, ultimaMensagem: created.dataHora, resumo: messagePreview(created.conteudo), naoVisualizada: false }
          : item));
      } else if (selectedProject) {
        setProjetos((items) => items.map((item) => item.id === selectedProject
          ? { ...item, ultimaMensagem: created.dataHora, resumo: messagePreview(created.conteudo), naoVisualizada: false }
          : item));
      }
      setConteudo("");
      setAnexos([]);
      const selection: ChatSelection | null = privateContact
        ? { type: "privado", email: privateContact.email }
        : selectedProject ? { type: "equipe", id: selectedProject } : null;
      if (selection) saveDraft(usuario.email, selection, "");
      textareaRef.current?.removeAttribute("style");
      textareaRef.current?.focus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar a mensagem.");
    }
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editing || (!editText.trim() && !editAnexo)) return;
    const files = editAnexo ? parseFiles(editAnexo) : [];
    const updated = await apiFetch<ChatMensagem>(withUser(`/chat/${editing.id}`), {
      method: "PUT",
      body: JSON.stringify({
        autorEmail: editing.autorEmail,
        autorNome: editing.autorNome,
        tipoChat: editing.tipoChat,
        conteudo: editText.trim() || "Anexo enviado.",
        anexo: files.length > 0 ? JSON.stringify(files) : null,
      }),
    });
    setMensagens((items) => items.map((item) => item.id === updated.id ? updated : item));
    setEditing(null);
    setEditText("");
    setEditAnexo("");
  }

  async function deleteMessage() {
    if (!deleting) return;
    const updated = await apiFetch<ChatMensagem>(withUser(`/chat/${deleting.id}`), { method: "DELETE" });
    setMensagens((items) => items.map((item) => item.id === updated.id ? updated : item));
    setDeleting(null);
  }

  async function leaveProject() {
    if (!selectedProject) return;
    try {
      await apiFetch(withUser(`/projetos/${selectedProject}/sair`), { method: "PUT" });
      setProjetos((items) => items.map((item) => item.id === selectedProject
        ? { ...item, statusMembro: "SAIU", dataSaida: new Date().toISOString() }
        : item));
      setMenuOpen(false);
      toast.success("Você saiu do projeto. O chat agora está disponível apenas para consulta.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível sair do projeto.");
    }
  }

  async function deleteChat() {
    if (!usuario) return;

    try {
      let teams = projetos;
      let contacts = contatos;
      if (privateContact) {
        await apiFetch(withUser(`/chat/privado?destinatario=${encodeURIComponent(privateContact.email)}`), { method: "DELETE" });
        saveDraft(usuario.email, { type: "privado", email: privateContact.email }, "");
        contacts = contatos.filter((item) => item.email !== privateContact.email);
        setContatos(contacts);
      } else if (selectedProject && frozen) {
        await apiFetch(withUser(`/projetos/${selectedProject}/chat`), { method: "DELETE" });
        teams = projetos.filter((item) => item.id !== selectedProject);
        setProjetos(teams);
      }

      clearSelection(usuario.email);
      setPrivateContact(null);
      setSelectedProject(null);
      setMensagens([]);
      const first = sortChats(teams, contacts)[0];
      if (first?.type === "equipe") selectProject(first.projeto.id);
      else if (first?.type === "privado") selectPrivate(first.contato);
      setConfirmDeleteChat(false);
      setMenuOpen(false);
      toast.success("Chat removido da sua lista.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível excluir o chat.");
    }
  }

  async function startPrivate(event: FormEvent) {
    event.preventDefault();
    const email = newChatEmail.trim().toLowerCase();
    if (!email || email === usuario?.email.toLowerCase()) {
      setNewChatError("Informe o e-mail de outro usuário.");
      return;
    }

    try {
      const contact = await apiFetch<ChatContato>(`/chats/usuarios?email=${encodeURIComponent(email)}`);
      selectPrivate(contact);
      setNewChatEmail("");
      setNewChatError("");
      setNewChatOpen(false);
    } catch (err) {
      setNewChatError(err instanceof Error ? err.message : "Usuário não encontrado.");
    }
  }

  function startPrivateWithMember(membro: MembroEquipe) {
    selectPrivate({
      email: membro.email,
      nome: membro.nome || "",
      sobrenome: membro.sobrenome || "",
    });
    setMembersOpen(false);
  }

  function removePending(index: number) {
    setAnexos((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  function downloadAttachment(file: ChatFile) {
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.nome;
    link.click();
  }

  return (
    <section className={styles.page}>
      <aside className={styles.chatList}>
        <div className={styles.listHeader}>
          <h2>Chats</h2>
          <button onClick={() => { setNewChatError(""); setNewChatOpen(true); }} aria-label="Nova conversa"><PlusIcon /></button>
        </div>
        {chatItems.map((item) => item.type === "equipe" ? (
          <button key={`equipe-${item.projeto.id}`} className={!privateContact && item.projeto.id === selectedProject ? styles.activeChat : ""} onClick={() => selectProject(item.projeto.id)}>
            <span>{item.projeto.nomeProjeto.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{item.projeto.nomeProjeto}</strong>
              <small className={styles.chatPreview}>
                <span>{item.projeto.resumo || "Nenhuma mensagem"}</span>
                <em className={styles.teamTag}>{item.projeto.statusMembro === "SAIU" ? "Somente leitura" : "Equipe"}</em>
              </small>
            </div>
            {item.projeto.naoVisualizada && <i className={styles.unreadDot} />}
          </button>
        ) : (
          <button key={`privado-${item.contato.email}`} className={privateContact?.email === item.contato.email ? styles.activeChat : ""} onClick={() => selectPrivate(item.contato)}>
            <span><UserAvatar fotoUrl={item.contato.fotoUrl} nome={item.contato.nome} email={item.contato.email} /></span>
            <div>
              <strong>{contactName(item.contato)}</strong>
              <small className={styles.chatPreview}><span>{item.contato.resumo || "Nenhuma mensagem"}</span></small>
            </div>
            {item.contato.naoVisualizada && <i className={styles.unreadDot} />}
          </button>
        ))}
      </aside>

      <main className={styles.chatBox}>
        {!hasChat && !loading ? (
          <div className={styles.emptyState}>
            <span>+</span>
            <h1>Inicie uma conversa</h1>
            <p>Converse com outro usuário pelo e-mail ou acesse um chat de equipe quando participar de um projeto.</p>
            <button onClick={() => { setNewChatError(""); setNewChatOpen(true); }}>Nova conversa</button>
          </div>
        ) : (
          <>
            <header className={styles.chatHeader}>
              <div>
                <h1>{title}</h1>
                <p>{privateContact ? "Conversa privada" : `${participantes.length} participantes`}</p>
              </div>
              {hasChat && (
                <div className={styles.headerActions}>
                  {!privateContact && (
                    <div className={styles.avatars}>
                      {participantes.slice(0, 6).map((membro) => (
                        <span key={membro.id} title={membro.email}>
                          <UserAvatar fotoUrl={membro.fotoUrl} nome={membro.nome} email={membro.email} />
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={styles.menuWrap}>
                    <button className={styles.menuButton} onClick={() => setMenuOpen((open) => !open)} aria-label="Opções do chat">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
                      </svg>
                    </button>
                    {menuOpen && (
                      <div className={styles.chatMenu}>
                        {!privateContact && <button onClick={() => { setMembersOpen(true); setMenuOpen(false); }}>Ver membros</button>}
                        {!privateContact && !frozen && !isLeader && <button onClick={leaveProject}>Sair do projeto</button>}
                        {(privateContact || frozen) && <button className={styles.dangerOption} onClick={() => setConfirmDeleteChat(true)}>Excluir chat</button>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </header>

            {loading && <p className={styles.message}>Carregando chat...</p>}
            {error && <p className={styles.message}>{error}</p>}
            {!loading && !error && (
              <>
                <div className={styles.feed} ref={feedRef}>
                  {feedItems.length === 0 && <p className={styles.empty}>Nenhuma mensagem enviada.</p>}
                  {feedItems.map((item) => {
                    if (item.type === "entrada" || item.type === "saida") {
                      const name = [item.membro.nome, item.membro.sobrenome].filter(Boolean).join(" ") || item.membro.email;
                      return (
                        <p key={`${item.type}-${item.membro.id}`} className={styles.systemMessage}>
                          {name} {item.type === "entrada" ? "entrou na equipe" : "saiu da equipe"}
                        </p>
                      );
                    }

                    const mensagem = item.mensagem;
                    const own = mensagem.autorEmail === usuario?.email;
                    return (
                      <article key={mensagem.id} className={`${styles.messageCard} ${own ? styles.own : ""}`}>
                        <div className={styles.messageTop}>
                          <strong>{mensagem.autorNome || mensagem.autorEmail}</strong>
                          <span>
                            {formatTime(mensagem.dataHora)}
                            {mensagem.editada && !mensagem.excluida && <button className={styles.editedTag} title={mensagem.conteudoAnterior || ""}>editada</button>}
                          </span>
                        </div>
                        <p>{mensagem.conteudo}</p>
                        {mensagem.anexo && parseFiles(mensagem.anexo).map((file, index) => (
                          <div key={`${file.nome}-${index}`} className={styles.fileBubble}>
                            <span>{file.tipo}</span>
                            <strong title={file.nome}>{file.nome}</strong>
                            <button onClick={() => openFile(file.data)}>Ver</button>
                            <button onClick={() => downloadAttachment(file)}>Baixar</button>
                          </div>
                        ))}
                        {own && !mensagem.excluida && (
                          <div className={styles.messageActions}>
                            <button onClick={() => { setEditing(mensagem); setEditText(mensagem.conteudo); setEditAnexo(mensagem.anexo || ""); }}>Editar</button>
                            <button onClick={() => setDeleting(mensagem)}>Excluir</button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
                {frozen ? <div className={styles.frozen}>Você saiu deste projeto. O chat está disponível apenas para consulta.</div> : (
                  <form className={styles.composer} onSubmit={sendMessage}>
                    {anexos.length > 0 && (
                      <div className={styles.pendingLine}>
                        {anexos.map((item, index) => {
                          const file = parseFile(item);
                          return (
                            <span key={`${file.nome}-${index}`} className={styles.pendingFile}>
                              <strong>{file.tipo}</strong><em title={file.nome}>{file.nome}</em>
                              <button type="button" onClick={() => removePending(index)} aria-label="Remover anexo"><CloseIcon /></button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <label className={styles.attachBtn}>
                      +
                      <input type="file" multiple onChange={(event) => {
                        Promise.all(Array.from(event.target.files ?? []).map(readFile))
                          .then((items) => setAnexos((prev) => [...prev, ...items]))
                          .catch((err) => toast.error(err.message));
                        event.currentTarget.value = "";
                      }} />
                    </label>
                    <textarea
                      ref={textareaRef}
                      value={conteudo}
                      onChange={(event) => {
                        const value = event.target.value;
                        setConteudo(value);
                        resizeTextarea(event.currentTarget);
                        if (!usuario) return;
                        if (privateContact) saveDraft(usuario.email, { type: "privado", email: privateContact.email }, value);
                        else if (selectedProject) saveDraft(usuario.email, { type: "equipe", id: selectedProject }, value);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          event.currentTarget.form?.requestSubmit();
                        }
                      }}
                      maxLength={1000}
                      rows={1}
                      placeholder="Mensagem"
                    />
                    <button type="submit" aria-label="Enviar mensagem">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7Z" /></svg>
                    </button>
                  </form>
                )}
              </>
            )}
          </>
        )}
      </main>

      {newChatOpen && (
        <div className={styles.overlay} onClick={() => setNewChatOpen(false)}>
          <form className={styles.editModal} onSubmit={startPrivate} onClick={(event) => event.stopPropagation()}>
            <h2>Nova conversa</h2>
            <p>Informe o e-mail do usuário com quem deseja conversar.</p>
            <input type="email" value={newChatEmail} onChange={(event) => setNewChatEmail(event.target.value)} placeholder="usuario@email.com" required />
            {newChatError && <small className={styles.modalError}>{newChatError}</small>}
            <div className={styles.confirmActions}>
              <button type="button" className={styles.secondaryBtn} onClick={() => setNewChatOpen(false)}>Cancelar</button>
              <button>Iniciar conversa</button>
            </div>
          </form>
        </div>
      )}

      {editing && (
        <div className={styles.overlay} onClick={() => setEditing(null)}>
          <form className={styles.editModal} onSubmit={saveEdit} onClick={(event) => event.stopPropagation()}>
            <h2>Editar mensagem</h2>
            <textarea value={editText} onChange={(event) => setEditText(event.target.value)} rows={4} />
            {editAnexo && parseFiles(editAnexo).map((file, index) => (
              <div key={`${file.nome}-${index}`} className={styles.editFile}>
                <span>{file.tipo}</span><strong title={file.nome}>{file.nome}</strong>
                <button type="button" onClick={() => setEditAnexo(JSON.stringify(parseFiles(editAnexo).filter((_, itemIndex) => itemIndex !== index)))}>Remover</button>
              </div>
            ))}
            <label className={styles.uploadEdit}>
              Trocar anexo
              <input type="file" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) readFile(file).then((item) => setEditAnexo(JSON.stringify([...(editAnexo ? parseFiles(editAnexo) : []), parseFile(item)]))).catch((err) => toast.error(err.message));
                event.currentTarget.value = "";
              }} />
            </label>
            <button>Salvar</button>
          </form>
        </div>
      )}

      {deleting && (
        <div className={styles.overlay} onClick={() => setDeleting(null)}>
          <div className={styles.editModal} onClick={(event) => event.stopPropagation()}>
            <h2>Excluir mensagem?</h2>
            <p>Ela ficará marcada como mensagem excluída.</p>
            <div className={styles.confirmActions}>
              <button onClick={deleteMessage}>Excluir</button>
              <button className={styles.secondaryBtn} onClick={() => setDeleting(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteChat && (
        <div className={styles.overlay} onClick={() => setConfirmDeleteChat(false)}>
          <div className={styles.editModal} onClick={(event) => event.stopPropagation()}>
            <h2>Excluir chat?</h2>
            <p>O chat será removido da sua lista e o histórico anterior deixará de aparecer para você. A outra pessoa continuará com as mensagens.</p>
            <div className={styles.confirmActions}>
              <button onClick={deleteChat}>Excluir chat</button>
              <button className={styles.secondaryBtn} onClick={() => setConfirmDeleteChat(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {membersOpen && (
        <div className={styles.overlay} onClick={() => setMembersOpen(false)}>
          <div className={styles.membersModal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Membros do chat</h2>
              <button onClick={() => setMembersOpen(false)} aria-label="Fechar"><CloseIcon /></button>
            </div>
            <div className={styles.membersList}>
              {membrosAtuais.map((membro) => (
                <div key={membro.id} className={styles.memberItem}>
                  <span><UserAvatar fotoUrl={membro.fotoUrl} nome={membro.nome} email={membro.email} /></span>
                  <div>
                    <strong>
                      {[membro.nome, membro.sobrenome].filter(Boolean).join(" ") || membro.email}
                      {membro.email === usuario?.email && <em> (Eu)</em>}
                    </strong>
                    <small>{membro.email}{membro.dataSaida ? " · Saiu da equipe" : ""}</small>
                  </div>
                  {membro.email !== usuario?.email && (
                    <button className={styles.privateButton} onClick={() => startPrivateWithMember(membro)}>Falar no privado</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

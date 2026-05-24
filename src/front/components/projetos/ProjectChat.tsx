"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, getSelectedProjectId } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { ChatMensagem } from "@/types/chat";
import { Equipe } from "@/types/equipe";
import { Projeto } from "@/types/projeto";
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
    reader.onload = () => {
      resolve(JSON.stringify({
        nome: file.name,
        tipo: fileType(file.name),
        mime: file.type || "application/octet-stream",
        data: String(reader.result),
      }));
    };
    reader.onerror = () => reject(new Error("Não foi possível ler o anexo."));
    reader.readAsDataURL(file);
  });
}

async function openFile(data: string) {
  const blob = await fetch(data).then((response) => response.blob());
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

function resizeTextarea(element: HTMLTextAreaElement) {
  element.style.height = "auto";
  element.style.height = `${Math.min(element.scrollHeight, 144)}px`;
}

export default function ProjectChat({ projetoId }: ProjectChatProps) {
  const [usuario] = useState<Usuario | null>(() => getCurrentUser());
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(projetoId ?? null);
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [mensagens, setMensagens] = useState<ChatMensagem[]>([]);
  const [conteudo, setConteudo] = useState("");
  const [anexos, setAnexos] = useState<string[]>([]);
  const [editing, setEditing] = useState<ChatMensagem | null>(null);
  const [editText, setEditText] = useState("");
  const [editAnexo, setEditAnexo] = useState("");
  const [deleting, setDeleting] = useState<ChatMensagem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      const data = await apiFetch<Projeto[]>("/projetos", { cache: "no-store" });
      setProjetos(data);
      setSelectedProject(projetoId ?? getSelectedProjectId() ?? data[0]?.id ?? null);
      if (data.length === 0) setLoading(false);
    }

    loadProjects().catch((err) => {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os chats.");
      setLoading(false);
    });
  }, [projetoId]);

  useEffect(() => {
    if (!selectedProject) return;

    async function loadChat() {
      try {
        setLoading(true);
        const [messages, team] = await Promise.all([
          apiFetch<ChatMensagem[]>(`/projetos/${selectedProject}/chat?tipo=EQUIPE`, { cache: "no-store" }),
          apiFetch<Equipe>(`/projetos/${selectedProject}/equipe`, { cache: "no-store" }),
        ]);
        setMensagens(messages);
        setEquipe(team);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível carregar o chat.");
      } finally {
        setLoading(false);
      }
    }

    loadChat();
  }, [selectedProject]);

  const projeto = useMemo(
    () => projetos.find((item) => item.id === selectedProject) ?? null,
    [projetos, selectedProject],
  );
  const participantes = equipe?.membros.filter((membro) => membro.status === "ACEITO") ?? [];

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!usuario || !selectedProject || (!conteudo.trim() && anexos.length === 0)) return;

    try {
      const created = await apiFetch<ChatMensagem>(`/projetos/${selectedProject}/chat`, {
        method: "POST",
        body: JSON.stringify({
          autorEmail: usuario.email,
          autorNome: `${usuario.nome} ${usuario.sobrenome}`.trim(),
          tipoChat: "EQUIPE",
          conteudo: conteudo.trim() || "Anexo enviado.",
          anexo: anexos.length > 0 ? JSON.stringify(anexos.map((item) => parseFile(item))) : null,
        }),
      });

      setMensagens((prev) => [...prev, created]);
      setConteudo("");
      setAnexos([]);
      form.querySelector("textarea")?.removeAttribute("style");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar a mensagem.");
    }
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editing || !selectedProject || (!editText.trim() && !editAnexo)) return;
    const files = editAnexo ? parseFiles(editAnexo) : [];

    const updated = await apiFetch<ChatMensagem>(`/chat/${editing.id}`, {
      method: "PUT",
      body: JSON.stringify({
        autorEmail: editing.autorEmail,
        autorNome: editing.autorNome,
        tipoChat: "EQUIPE",
        conteudo: editText.trim() || "Anexo enviado.",
        anexo: files.length > 0 ? JSON.stringify(files) : null,
      }),
    });

    setMensagens((items) => items.map((item) => item.id === updated.id ? updated : item));
    setEditing(null);
    setEditText("");
    setEditAnexo("");
  }

  async function deleteMessage(mensagem: ChatMensagem) {
    const updated = await apiFetch<ChatMensagem>(`/chat/${mensagem.id}`, { method: "DELETE" });
    setMensagens((items) => items.map((item) => item.id === updated.id ? updated : item));
    setDeleting(null);
  }

  async function openAttachment(value: string) {
    await openFile(value);
  }

  function downloadAttachment(file: ChatFile) {
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.nome;
    link.click();
  }

  function removePending(index: number) {
    setAnexos((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <section className={styles.page}>
      <aside className={styles.chatList}>
        <h2>Chats</h2>
        {projetos.map((item) => (
          <button
            key={item.id}
            className={item.id === selectedProject ? styles.activeChat : ""}
            onClick={() => setSelectedProject(item.id)}
          >
            <span>{item.nomeProjeto.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{item.nomeProjeto}</strong>
              <small>Equipe</small>
            </div>
          </button>
        ))}
      </aside>

      <main className={styles.chatBox}>
        <header className={styles.chatHeader}>
          <div>
            <h1>{projeto?.nomeProjeto ?? "Chat"}</h1>
            <p>{participantes.length} participantes</p>
          </div>
          <div className={styles.avatars}>
            {participantes.slice(0, 6).map((membro) => (
              <span key={membro.id} title={`${membro.email}`}>
                {membro.email.slice(0, 1).toUpperCase()}
              </span>
            ))}
          </div>
        </header>

        {loading && <p className={styles.message}>Carregando chat...</p>}
        {error && <p className={styles.message}>{error}</p>}

        {!loading && !error && (
          <>
            <div className={styles.feed}>
              {mensagens.length === 0 && <p className={styles.empty}>Nenhuma mensagem enviada.</p>}
              {mensagens.map((mensagem) => {
                const own = mensagem.autorEmail === usuario?.email;
                return (
                  <article key={mensagem.id} className={`${styles.messageCard} ${own ? styles.own : ""}`}>
                    <div className={styles.messageTop}>
                      <strong>{mensagem.autorNome || mensagem.autorEmail}</strong>
                      <span>
                        {formatTime(mensagem.dataHora)}
                        {mensagem.editada && !mensagem.excluida && (
                          <button className={styles.editedTag} title={mensagem.conteudoAnterior || ""}>
                            editada
                          </button>
                        )}
                      </span>
                    </div>
                    <p>{mensagem.conteudo}</p>
                    {mensagem.anexo && parseFiles(mensagem.anexo).map((file, index) => (
                      <div key={`${file.nome}-${index}`} className={styles.fileBubble}>
                        <span>{file.tipo}</span>
                        <strong title={file.nome}>{file.nome}</strong>
                        <button onClick={() => openAttachment(file.data)}>Ver</button>
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

            <form className={styles.composer} onSubmit={sendMessage}>
              {anexos.length > 0 && (
                <div className={styles.pendingLine}>
                  {anexos.map((item, index) => {
                    const file = parseFile(item);
                    return (
                      <span key={`${file.nome}-${index}`} className={styles.pendingFile}>
                        <strong>{file.tipo}</strong>
                        <em title={file.nome}>{file.nome}</em>
                        <button type="button" onClick={() => removePending(index)} aria-label="Remover anexo">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
              <label className={styles.attachBtn}>
                +
	        <input
	                  type="file"
	                  multiple
		                  onChange={(event) => {
		                    const files = Array.from(event.target.files ?? []);
		                    Promise.all(files.map(readFile))
                        .then((items) => setAnexos((prev) => [...prev, ...items]))
                        .catch((err) => toast.error(err.message));
                    event.currentTarget.value = "";
		                  }}
		                />
              </label>
              <textarea
	                value={conteudo}
	                onChange={(event) => {
                    setConteudo(event.target.value);
                    resizeTextarea(event.currentTarget);
                  }}
	                maxLength={1000}
                rows={1}
                placeholder="Mensagem"
              />
              <button type="submit" aria-label="Enviar mensagem">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
          </>
        )}
      </main>

      {editing && (
        <div className={styles.overlay} onClick={() => setEditing(null)}>
          <form className={styles.editModal} onSubmit={saveEdit} onClick={(event) => event.stopPropagation()}>
            <h2>Editar mensagem</h2>
            <textarea value={editText} onChange={(event) => setEditText(event.target.value)} rows={4} />
            {editAnexo && parseFiles(editAnexo).map((file, index) => (
              <div key={`${file.nome}-${index}`} className={styles.editFile}>
                <span>{file.tipo}</span>
                <strong title={file.nome}>{file.nome}</strong>
                <button
                  type="button"
                  onClick={() => setEditAnexo(JSON.stringify(parseFiles(editAnexo).filter((_, itemIndex) => itemIndex !== index)))}
                >
                  Remover
                </button>
              </div>
            ))}
            <label className={styles.uploadEdit}>
              Trocar anexo
		              <input type="file" onChange={(event) => {
		                const file = event.target.files?.[0];
		                if (file) readFile(file)
                      .then((item) => setEditAnexo(JSON.stringify([...parseFiles(editAnexo), parseFile(item)])))
                      .catch((err) => toast.error(err.message));
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
              <button onClick={() => deleteMessage(deleting)}>Excluir</button>
              <button className={styles.secondaryBtn} onClick={() => setDeleting(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

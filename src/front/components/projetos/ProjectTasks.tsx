"use client";

import { FormEvent, MouseEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, withUser } from "@/lib/auth";
import { toast } from "@/lib/toast";
import UserAvatar from "@/components/ui/UserAvatar";
import { Equipe } from "@/types/equipe";
import { Tarefa } from "@/types/tarefa";
import { Usuario } from "@/types/usuario";
import styles from "./ProjectTasks.module.css";

interface ProjectTasksProps {
  projetoId: number;
}

type Column = {
  id: number;
  nome: string;
  ordem?: number;
};

type DeletedColumn = {
  id: number;
  nome: string;
  tarefas: Tarefa[];
};

type ChecklistItem = {
  id: string;
  texto: string;
  feito: boolean;
};

type Comentario = {
  id: string;
  autor: string;
  texto: string;
  data: string;
  especial?: boolean;
};

type Anexo = {
  id: string;
  nome: string;
  tipo: string;
  mime?: string;
  data?: string;
};

type DragItem = {
  type: "task" | "column";
  id: string;
  startX: number;
  startY: number;
  moved: boolean;
};

const defaultColumn = "A fazer";

function getColumnsKey(projetoId: number) {
  return `acadus_colunas_${projetoId}`;
}

function getDeletedColumnsKey(projetoId: number) {
  return `acadus_colunas_lixeira_${projetoId}`;
}

function getTaskOrderKey(projetoId: number) {
  return `acadus_tarefas_ordem_${projetoId}`;
}

function getSavedKey(id: number) {
  return `acadus_tarefa_salva_${id}`;
}

function readJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

function clearOldBoardState(projetoId: number) {
  localStorage.removeItem(getColumnsKey(projetoId));
  localStorage.removeItem(getDeletedColumnsKey(projetoId));
  localStorage.removeItem(getTaskOrderKey(projetoId));
}

function sortTasks(tarefas: Tarefa[]) {
  return [...tarefas].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.id - b.id);
}

function parseChecklist(value?: string | null): ChecklistItem[] {
  if (!value) return [];

  if (value.trim().startsWith("[{")) {
    const parsed = readJson<ChecklistItem[] | null>(value, null);
    if (parsed) return parsed;
  }

  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item, index) => ({
      id: `${Date.now()}-${index}`,
      feito: item.toLowerCase().startsWith("[x]"),
      texto: item.replace(/^\[(x| )\]\s*/i, ""),
    }));
}

function checklistText(items: ChecklistItem[]) {
  return items.map((item) => `${item.feito ? "[x]" : "[ ]"} ${item.texto}`).join("\n");
}

function progress(items: ChecklistItem[]) {
  if (items.length === 0) return 0;
  return Math.round((items.filter((item) => item.feito).length * 100) / items.length);
}

function nowId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function today() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function currentTime() {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function fileType(name: string) {
  const ext = name.split(".").pop()?.toUpperCase() || "ARQ";
  if (["JPG", "JPEG"].includes(ext)) return "IMG";
  if (["PNG", "WEBP", "GIF"].includes(ext)) return ext;
  if (["PDF", "DOC", "DOCX", "XLS", "XLSX", "PPT", "PPTX"].includes(ext)) return ext;
  return "ARQ";
}

function readFile(file: File): Promise<Anexo> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: nowId(),
        nome: file.name,
        tipo: fileType(file.name),
        mime: file.type || "application/octet-stream",
        data: String(reader.result),
      });
    };
    reader.onerror = () => reject(new Error("Não foi possível ler o anexo."));
    reader.readAsDataURL(file);
  });
}

function attachmentCount(value?: string | null) {
  return readJson<Anexo[]>(value, []).length;
}

function checklistStats(value?: string | null) {
  const items = parseChecklist(value);
  return {
    done: items.filter((item) => item.feito).length,
    total: items.length,
  };
}

function IconX({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

async function openFile(data: string) {
  const blob = await fetch(data).then((response) => response.blob());
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

export default function ProjectTasks({ projetoId }: ProjectTasksProps) {
  const [usuario] = useState<Usuario | null>(() => getCurrentUser());
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [lixeira, setLixeira] = useState<Tarefa[]>([]);
  const [colunas, setColunas] = useState<Column[]>([]);
  const [columnsProjectId, setColumnsProjectId] = useState(projetoId);
  const [deletedColumns, setDeletedColumns] = useState<DeletedColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newColumn, setNewColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [editingColumn, setEditingColumn] = useState<number | null>(null);
  const [editingColumnName, setEditingColumnName] = useState("");
  const [newTaskColumn, setNewTaskColumn] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [selected, setSelected] = useState<Tarefa | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklist, setNewChecklist] = useState("");
  const [comments, setComments] = useState<Comentario[]>([]);
  const [commentText, setCommentText] = useState("");
  const [attachments, setAttachments] = useState<Anexo[]>([]);
  const [membersOpen, setMembersOpen] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [adjustText, setAdjustText] = useState("");
  const [draft, setDraft] = useState({ descricao: "", prazo: "", horaPrazo: "", responsavel: "" });
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [restoreColumn, setRestoreColumn] = useState<DeletedColumn | null>(null);
  const [restoreIds, setRestoreIds] = useState<number[]>([]);
  const [deleteColumn, setDeleteColumn] = useState<DeletedColumn | null>(null);
  const [trashColumn, setTrashColumn] = useState<Column | null>(null);
  const [deleteTask, setDeleteTask] = useState<Tarefa | null>(null);
  const [restoreTask, setRestoreTask] = useState<Tarefa | null>(null);
  const [restoreTaskColumn, setRestoreTaskColumn] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [commentEditText, setCommentEditText] = useState("");
  const [deleteComment, setDeleteComment] = useState<Comentario | null>(null);
  const [moreChecklist, setMoreChecklist] = useState(false);
  const [moreComments, setMoreComments] = useState(false);
  const touchDrag = useRef<DragItem | null>(null);
  const ignoreClick = useRef(false);
  const checklistRef = useRef<HTMLDivElement | null>(null);
  const commentsRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState<DragItem | null>(null);

  const isLeader = Boolean(usuario?.email && (!equipe?.liderEmail || equipe.liderEmail === usuario.email));
  const membros = useMemo(() => {
    const aceitos = equipe?.membros.filter((membro) => membro.status === "ACEITO" && !membro.dataSaida) ?? [];
    if (!usuario || aceitos.some((membro) => membro.email === usuario.email)) return aceitos;

    return [
      {
        id: -1,
        projetoId,
        email: usuario.email,
        papel: "LIDER" as const,
        status: "ACEITO" as const,
        dataConvite: "1970-01-01",
      },
      ...aceitos,
    ];
  }, [equipe, projetoId, usuario]);
  const selectedProgress = progress(checklist);
  const locked = selected?.status === "APROVADA";
  const awaitingValidation = selected?.status === "EM_VALIDACAO";
  const awaitingAdjustments = selected?.status === "AJUSTES";
  const frozen = locked || awaitingValidation || awaitingAdjustments;
  const canEditDetails = isLeader && !frozen;
  const canInteract = !frozen;
  const selectedMembers = draft.responsavel.split(",").map((item) => item.trim()).filter(Boolean);
  const selectedMembros = membros.filter((membro) => selectedMembers.includes(membro.email));
  const availableMembros = membros.filter((membro) => !selectedMembers.includes(membro.email));
  const projectColumns = useMemo(
    () => columnsProjectId === projetoId ? colunas : [],
    [columnsProjectId, colunas, projetoId],
  );
  const restoreColumns = projectColumns;

  useEffect(() => {
    function update(element: HTMLDivElement | null, setMore: (value: boolean) => void) {
      if (!element) {
        setMore(false);
        return;
      }
      setMore(element.scrollTop + element.clientHeight < element.scrollHeight - 2);
    }

    function updateLists() {
      update(checklistRef.current, setMoreChecklist);
      update(commentsRef.current, setMoreComments);
    }

    const frame = window.requestAnimationFrame(updateLists);
    const observer = new ResizeObserver(updateLists);
    if (checklistRef.current) observer.observe(checklistRef.current);
    if (commentsRef.current) observer.observe(commentsRef.current);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [selected, checklist, comments, editingComment]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      setTarefas([]);
      setLixeira([]);
      setSelected(null);
      setColunas([]);
      setDeletedColumns([]);
      setColumnsProjectId(projetoId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [projetoId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [tasks, deleted, team, columns, deletedBoardColumns] = await Promise.all([
          apiFetch<Tarefa[]>(`/projetos/${projetoId}/tarefas`, { cache: "no-store" }),
          apiFetch<Tarefa[]>(`/projetos/${projetoId}/tarefas/lixeira`, { cache: "no-store" }),
          apiFetch<Equipe>(`/projetos/${projetoId}/equipe`, { cache: "no-store" }),
          apiFetch<Column[]>(withUser(`/projetos/${projetoId}/colunas`), { cache: "no-store" }),
          apiFetch<Column[]>(withUser(`/projetos/${projetoId}/colunas?excluidas=true`), { cache: "no-store" }),
        ]);

        if (cancelled) return;

        setTarefas(sortTasks(tasks));
        setLixeira(deleted);
        setEquipe(team);
        setError("");
        setColunas(columns);
        setDeletedColumns(deletedBoardColumns.map((column) => ({
          ...column,
          tarefas: deleted.filter((task) => (task.coluna || defaultColumn) === column.nome),
        })));
        clearOldBoardState(projetoId);
        setColumnsProjectId(projetoId);
      } catch (err) {
        if (cancelled) return;
        const message = errorMessage(err, "Erro ao carregar tarefas.");
        setError(message);
        toast.error(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [projetoId]);

  const board = useMemo(() => {
    return projectColumns.map((coluna) => ({
      ...coluna,
      tarefas: tarefas.filter((tarefa) => (tarefa.coluna || defaultColumn) === coluna.nome),
    }));
  }, [projectColumns, tarefas]);

  async function createColumn(event?: FormEvent) {
    event?.preventDefault();
    if (!isLeader) return;
    const nome = newColumnName.trim();

    if (!nome || colunas.length >= 10 || colunas.some((coluna) => coluna.nome.toLowerCase() === nome.toLowerCase())) {
      setNewColumn(false);
      setNewColumnName("");
      return;
    }

    try {
      const created = await apiFetch<Column>(withUser(`/projetos/${projetoId}/colunas`), {
        method: "POST",
        body: JSON.stringify({ nome }),
      });
      setColunas([...colunas, created]);
      setNewColumn(false);
      setNewColumnName("");
    } catch (err) {
      toast.error(errorMessage(err, "Não foi possível criar a coluna."));
    }
  }

  async function renameColumn(column: Column) {
    const nome = editingColumnName.trim();
    setEditingColumn(null);
    setEditingColumnName("");

    if (!isLeader || !nome || nome === column.nome) return;
    if (colunas.some((item) => item.id !== column.id && item.nome.toLowerCase() === nome.toLowerCase())) {
      toast.error("Já existe uma coluna com este nome.");
      return;
    }

    try {
      const updated = await apiFetch<Column>(withUser(`/colunas/${column.id}`), {
        method: "PUT",
        body: JSON.stringify({ nome }),
      });
      setTarefas((items) => items.map((task) => task.coluna === column.nome ? { ...task, coluna: updated.nome } : task));
      setColunas((items) => items.map((item) => item.id === column.id ? updated : item));
    } catch (err) {
      toast.error(errorMessage(err, "Não foi possível alterar o nome da coluna."));
    }
  }

  async function moveColumn(columnId: string, targetId: string) {
    if (!isLeader || !columnId || columnId === targetId) return;

    const from = colunas.findIndex((item) => item.id === Number(columnId));
    const to = colunas.findIndex((item) => item.id === Number(targetId));
    if (from < 0 || to < 0) return;
    const next = [...colunas];
    const [column] = next.splice(from, 1);
    next.splice(to, 0, column);
    setColunas(next);
    try {
      await apiFetch(withUser(`/projetos/${projetoId}/colunas/ordem`), {
        method: "PUT",
        body: JSON.stringify({ ids: next.map((item) => item.id) }),
      });
    } catch (err) {
      setColunas(colunas);
      toast.error(errorMessage(err, "Não foi possível ordenar as colunas."));
    }
  }

  function startTouchDrag(event: PointerEvent, type: "task" | "column", id: string) {
    if (type === "column" && !isLeader) return;
    if (event.pointerType === "mouse") return;
    if ((event.target as HTMLElement).closest("button,input,textarea,select")) return;

    touchDrag.current = {
      type,
      id,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    setDragging(null);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveTouchDrag(event: PointerEvent) {
    const item = touchDrag.current;
    if (!item || event.pointerType === "mouse") return;

    const moved = Math.abs(event.clientX - item.startX) > 8 || Math.abs(event.clientY - item.startY) > 8;
    if (!moved && !item.moved) return;

    item.moved = true;
    ignoreClick.current = true;
    setDragging({ ...item });
  }

  function endTouchDrag(event: PointerEvent) {
    const item = touchDrag.current;
    if (!item || event.pointerType === "mouse") return;

    touchDrag.current = null;
    setDragging(null);

    if (!item.moved) return;

    const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    const trash = target?.closest("[data-trash='true']");
    const taskTarget = target?.closest("[data-task-id]") as HTMLElement | null;
    const columnTarget = target?.closest("[data-column-id]") as HTMLElement | null;

    if (trash) {
      if (item.type === "task") void sendToTrash(Number(item.id), "task");
      if (item.type === "column") askTrashColumn(item.id);
    } else if (columnTarget) {
      const targetId = columnTarget.dataset.columnId;
      const targetName = columnTarget.dataset.columnName;

      if (item.type === "column" && targetId) moveColumn(item.id, targetId);
      if (item.type === "task" && targetName) {
        const tarefa = tarefas.find((task) => task.id === Number(item.id));
        const rect = taskTarget?.getBoundingClientRect();
        const after = rect ? event.clientY > rect.top + rect.height / 2 : false;
        if (tarefa) void moveTask(tarefa, targetName, Number(taskTarget?.dataset.taskId) || undefined, after);
      }
    }

    window.setTimeout(() => {
      ignoreClick.current = false;
    }, 80);
  }

  async function createTask(event: FormEvent, coluna: string) {
    event.preventDefault();
    if (!isLeader) return;
    const nome = newTaskName.trim();
    if (nome.length < 3) {
      setNewTaskColumn("");
      setNewTaskName("");
      return;
    }

    try {
      const created = await apiFetch<Tarefa>(withUser(`/projetos/${projetoId}/tarefas`), {
        method: "POST",
        body: JSON.stringify({
          nome,
          descricao: null,
          responsavel: null,
          coluna,
          prazo: null,
          horaPrazo: null,
          comentario: "[]",
          checklist: null,
          anexo: "[]",
          status: "PENDENTE",
          progresso: 0,
        }),
      });
      setTarefas((items) => [...items, created]);
    } catch (err) {
      toast.error(errorMessage(err, "Não foi possível criar a tarefa."));
    } finally {
      setNewTaskColumn("");
      setNewTaskName("");
    }
  }

  function openTask(tarefa: Tarefa) {
    setSelected(tarefa);
    setChecklist(parseChecklist(tarefa.checklist));
    setComments(readJson<Comentario[]>(tarefa.comentario, []));
    setAttachments(readJson<Anexo[]>(tarefa.anexo, []));
    setDraft({
      descricao: tarefa.descricao ?? "",
      prazo: tarefa.prazo ?? "",
      horaPrazo: tarefa.horaPrazo ?? "",
      responsavel: tarefa.responsavel ?? "",
    });
    setDirty(false);
    setEditingComment(null);
    setCommentEditText("");
    setDeleteComment(null);
    setSavedAt(localStorage.getItem(getSavedKey(tarefa.id)));
  }

  async function saveTask(extra: Partial<Tarefa> = {}) {
    if (!selected) return null;
    const nome = selected.nome.trim();
    const cleanChecklist = checklist.filter((item) => item.texto.trim());

    if (nome.length < 3) {
      toast.error("Informe um nome de tarefa com pelo menos 3 caracteres.");
      return null;
    }

    if (nome.length > 100) {
      toast.error("O título da tarefa deve ter no máximo 100 caracteres.");
      return null;
    }

    if (draft.descricao.length > 800) {
      toast.error("A descrição deve ter no máximo 800 caracteres.");
      return null;
    }

    const payload = {
      nome,
      descricao: draft.descricao || null,
      responsavel: draft.responsavel || null,
      coluna: selected.coluna || defaultColumn,
      prazo: draft.prazo || null,
      horaPrazo: draft.horaPrazo || null,
      comentario: JSON.stringify(comments),
      checklist: checklistText(cleanChecklist) || null,
      anexo: JSON.stringify(attachments),
      status: selected.status,
      progresso: progress(cleanChecklist),
      excluida: selected.excluida ?? false,
      ...extra,
    };

    try {
      const updated = await apiFetch<Tarefa>(withUser(`/tarefas/${selected.id}`), {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setSelected(updated);
      setChecklist(cleanChecklist);
      setTarefas((items) => items.map((item) => item.id === updated.id ? updated : item));
      setDirty(false);
      const saved = new Date().toISOString();
      localStorage.setItem(getSavedKey(updated.id), saved);
      setSavedAt(saved);
      return updated;
    } catch (err) {
      toast.error(errorMessage(err, "Não foi possível salvar a tarefa."));
      return null;
    }
  }

  async function moveTask(tarefa: Tarefa, coluna: string, targetId?: number, after = false) {
    if (targetId === tarefa.id) return;
    const column = colunas.find((item) => item.nome === coluna);
    if (!column) return;
    const destination = tarefas.filter((item) => item.id !== tarefa.id && item.coluna === coluna);
    const target = targetId ? destination.findIndex((item) => item.id === targetId) : -1;
    const posicao = target >= 0 ? target + Number(after) : destination.length;
    try {
      const updated = await apiFetch<Tarefa>(withUser(`/tarefas/${tarefa.id}/movimento`), {
        method: "PUT",
        body: JSON.stringify({ colunaId: column.id, posicao }),
      });
      setTarefas((items) => {
        const next = items.filter((item) => item.id !== updated.id);
        const index = targetId ? next.findIndex((item) => item.id === targetId) : -1;
        next.splice(index >= 0 ? index + Number(after) : next.length, 0, updated);
        return next;
      });
    } catch (err) {
      toast.error(errorMessage(err, "Não foi possível mover a tarefa."));
    }
  }

  function askTrashColumn(id: string) {
    if (!isLeader) return;
    const column = colunas.find((item) => item.id === Number(id));
    if (column) setTrashColumn(column);
  }

  async function sendToTrash(id: number | string, type: "task" | "column") {
    if (!isLeader) return;
    try {
      if (type === "column") {
        const column = colunas.find((item) => item.id === Number(id));
        if (!column) return;
        const tasks = tarefas.filter((task) => (task.coluna || defaultColumn) === column.nome);
        await apiFetch(withUser(`/colunas/${column.id}`), { method: "DELETE" });
        setColunas((items) => items.filter((item) => item.id !== column.id));
        setDeletedColumns((items) => [...items, { ...column, tarefas: tasks }]);
        setLixeira((items) => [...items, ...tasks.map((task) => ({ ...task, excluida: true }))]);
        setTarefas((items) => items.filter((task) => (task.coluna || defaultColumn) !== column.nome));
        return;
      }

      const tarefa = tarefas.find((task) => task.id === id);
      if (!tarefa) return;

      await apiFetch(withUser(`/tarefas/${id}`), { method: "DELETE" });
      setTarefas((items) => items.filter((task) => task.id !== id));
      setLixeira((items) => [...items, { ...tarefa, excluida: true }]);
      setSelected(null);
    } catch (err) {
      toast.error(errorMessage(err, "Não foi possível enviar o item para a lixeira."));
      return;
    }
  }

  async function openAttachment(file: Anexo) {
    if (!file.data) return;
    await openFile(file.data);
  }

  function downloadAttachment(file: Anexo) {
    if (!file.data) return;
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.nome;
    link.click();
  }

  function closeFloatingPanels(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (!target.closest("[data-floating='members']")) setMembersOpen(false);
    if (!target.closest("[data-floating='date']")) setDateOpen(false);
  }

  function removeAttachment(id: string) {
    setAttachments((items) => items.filter((item) => item.id !== id));
    setDirty(true);
  }

  function addChecklistItem() {
    const texto = newChecklist.trim();
    if (!texto) return;
    setChecklist([...checklist, { id: nowId(), texto, feito: false }]);
    setNewChecklist("");
    setDirty(true);
  }

  function moveChecklist(from: number, to: number) {
    const next = [...checklist];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setChecklist(next);
    setDirty(true);
  }

  function removeChecklistItem(id: string) {
    setChecklist((items) => items.filter((item) => item.id !== id));
    setDirty(true);
  }

  async function addComment(especial = false, texto = commentText) {
    if (!texto.trim() || !usuario) return;
    addLocalComment(texto.trim(), especial);
    setCommentText("");
    setDirty(true);
  }

  function addLocalComment(texto: string, especial = false) {
    const next = [
      ...comments,
      {
        id: nowId(),
        autor: usuario ? `${usuario.nome} ${usuario.sobrenome}`.trim() || usuario.email : "Usuário",
        texto,
        data: new Date().toISOString(),
        especial,
      },
    ];
    setComments(next);
    return next;
  }

  async function removeComment(id: string) {
    const next = comments.filter((comment) => comment.id !== id);
    setComments(next);
    setDirty(true);
  }

  function startEditComment(comment: Comentario) {
    setEditingComment(comment.id);
    setCommentEditText(comment.texto);
  }

  function saveCommentEdit(id: string) {
    const texto = commentEditText.trim();
    if (!texto) return;
    setComments((items) => items.map((comment) => comment.id === id ? { ...comment, texto } : comment));
    setEditingComment(null);
    setCommentEditText("");
    setDirty(true);
  }

  async function submitValidation() {
    if (checklist.length > 0 && checklist.some((item) => !item.feito)) {
      toast.error("Conclua todo o checklist antes de enviar para validação.");
      return;
    }
    const next = addLocalComment("Tarefa enviada para validação.", true);
    const updated = await saveTask({ status: "EM_VALIDACAO", comentario: JSON.stringify(next) });
    if (!updated) return;
    toast.success("Tarefa enviada para validação.");
  }

  async function approveTask() {
    const next = addLocalComment("Tarefa aprovada.", true);
    const updated = await saveTask({ status: "APROVADA", comentario: JSON.stringify(next) });
    if (!updated) return;
    setApprovalOpen(false);
    toast.success("Tarefa aprovada.");
  }

  async function cancelValidation() {
    const next = addLocalComment("Envio para validação cancelado.", true);
    const updated = await saveTask({ status: "EM_ANDAMENTO", comentario: JSON.stringify(next) });
    if (!updated) return;
    toast.success("Envio para validação cancelado.");
  }

  async function beginAdjustments() {
    const next = addLocalComment("Ajustes iniciados.", true);
    const updated = await saveTask({ status: "EM_ANDAMENTO", comentario: JSON.stringify(next) });
    if (!updated) return;
    toast.success("Ajustes iniciados.");
  }

  async function requestAdjustments(event: FormEvent) {
    event.preventDefault();
    const texto = adjustText.trim();
    if (!texto) return;
    const next = addLocalComment(`Ajustes solicitados: ${texto}`, true);
    const updated = await saveTask({ status: "AJUSTES", comentario: JSON.stringify(next) });
    if (!updated) return;
    setAdjustOpen(false);
    setAdjustText("");
    toast.success("Ajustes solicitados.");
  }

  function toggleMember(email: string) {
    const set = new Set(selectedMembers);
    if (set.has(email)) {
      set.delete(email);
    } else {
      set.add(email);
    }
    setDraft({ ...draft, responsavel: Array.from(set).join(", ") });
    setDirty(true);
  }

  function closeTask() {
    if (dirty) {
      setConfirmClose(true);
      return;
    }
    setSelected(null);
    setEditingComment(null);
    setCommentEditText("");
    setDeleteComment(null);
  }

  function setDraftValue(value: Partial<typeof draft>) {
    setDraft({ ...draft, ...value });
    setDirty(true);
  }

  function toggleChecklist(id: string, feito: boolean) {
    setChecklist(checklist.map((item) => item.id === id ? { ...item, feito } : item));
    setDirty(true);
  }

  function changeChecklistText(id: string, texto: string) {
    setChecklist(checklist.map((item) => item.id === id ? { ...item, texto } : item));
    setDirty(true);
  }

  function cleanChecklistText(id: string) {
    setChecklist((items) => items.filter((item) => item.id !== id || item.texto.trim()));
  }

  async function restoreDeletedColumn(column: DeletedColumn, ids: number[]) {
    try {
      await apiFetch(withUser(`/colunas/${column.id}/restaurar`), {
        method: "PUT",
        body: JSON.stringify({ tarefaIds: ids }),
      });
      const selectedTasks = column.tarefas.filter((task) => ids.includes(task.id)).map((task) => ({ ...task, excluida: false }));
      setColunas((items) => [...items, { id: column.id, nome: column.nome }]);
      setTarefas((items) => [...items, ...selectedTasks]);
      setLixeira((items) => items.filter((task) => !ids.includes(task.id)));
      setDeletedColumns((items) => items.filter((item) => item.id !== column.id));
      setRestoreColumn(null);
    } catch (err) {
      toast.error(errorMessage(err, "Não foi possível restaurar a coluna."));
    }
  }

  function askRestoreTask(task: Tarefa) {
    const columnName = task.coluna || defaultColumn;
    if (colunas.some((item) => item.nome === columnName)) {
      restoreDeletedTask(task, columnName);
      return;
    }

    setRestoreTask(task);
    setRestoreTaskColumn(restoreColumns[0]?.nome ?? "");
  }

  async function restoreDeletedTask(task: Tarefa, columnName: string) {
    const column = colunas.find((item) => item.nome === columnName);
    if (!column) return;
    try {
      const updated = await apiFetch<Tarefa>(withUser(`/tarefas/${task.id}/restaurar`), {
        method: "PUT",
        body: JSON.stringify({ colunaId: column.id }),
      });
      setTarefas((items) => [...items.filter((item) => item.id !== updated.id), updated]);
      setLixeira((items) => items.filter((item) => item.id !== updated.id));
      setRestoreTask(null);
    } catch (err) {
      toast.error(errorMessage(err, "Não foi possível restaurar a tarefa."));
    }
  }

  async function deleteTaskForever(task: Tarefa) {
    try {
      await apiFetch(withUser(`/tarefas/${task.id}/definitivo`), { method: "DELETE" });
      setLixeira((items) => items.filter((item) => item.id !== task.id));
      setDeleteTask(null);
    } catch (err) {
      toast.error(errorMessage(err, "Não foi possível excluir a tarefa."));
    }
  }

  async function deleteColumnForever(column: DeletedColumn) {
    try {
      await apiFetch(withUser(`/colunas/${column.id}/definitivo`), { method: "DELETE" });
      const ids = column.tarefas.map((task) => task.id);
      setLixeira((items) => items.filter((task) => !ids.includes(task.id)));
      setDeletedColumns((items) => items.filter((item) => item.id !== column.id));
      setDeleteColumn(null);
    } catch (err) {
      toast.error(errorMessage(err, "Não foi possível excluir a coluna."));
    }
  }

  function openRestoreColumn(column: DeletedColumn) {
    setRestoreColumn(column);
    setRestoreIds(column.tarefas.map((task) => task.id));
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Tarefas</h2>
          <p>{tarefas.length} tarefas no quadro</p>
        </div>
      </div>

      {loading && <p className={styles.message}>Carregando tarefas...</p>}
      {error && <p className={styles.message}>{error}</p>}

      {!loading && !error && (
        <div className={styles.board}>
          {board.map((coluna) => (
            <section
              key={coluna.id}
              className={`${styles.column} ${dragging?.type === "column" && dragging.id === String(coluna.id) ? styles.dragging : ""}`}
              data-column-id={coluna.id}
              data-column-name={coluna.nome}
              draggable={isLeader}
              onPointerDown={(event) => startTouchDrag(event, "column", String(coluna.id))}
              onPointerMove={moveTouchDrag}
              onPointerUp={endTouchDrag}
              onPointerCancel={endTouchDrag}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("column", String(coluna.id));
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const columnId = event.dataTransfer.getData("column");
                if (columnId) {
                  void moveColumn(columnId, String(coluna.id));
                  return;
                }

                const id = Number(event.dataTransfer.getData("task"));
                const tarefa = tarefas.find((task) => task.id === id);
                if (tarefa) moveTask(tarefa, coluna.nome);
              }}
            >
              <div className={styles.columnHeader}>
                {editingColumn === coluna.id ? (
                  <input
                    className={styles.columnTitleInput}
                    value={editingColumnName}
                    autoFocus
                    onPointerDown={(event) => event.stopPropagation()}
                    onChange={(event) => setEditingColumnName(event.target.value)}
                    onBlur={() => renameColumn(coluna)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void renameColumn(coluna);
                      if (event.key === "Escape") {
                        setEditingColumn(null);
                        setEditingColumnName("");
                      }
                    }}
                  />
                ) : (
                  <h3
                    onClick={() => {
                      if (!isLeader) return;
                      setEditingColumn(coluna.id);
                      setEditingColumnName(coluna.nome);
                    }}
                  >
                    {coluna.nome}
                  </h3>
                )}
                <small>{coluna.tarefas.length}</small>
              </div>

              <div className={styles.cardList}>
                {coluna.tarefas.map((tarefa) => (
                  <article
                    key={tarefa.id}
                    className={`${styles.card} ${tarefa.status === "APROVADA" ? styles.doneCard : ""} ${tarefa.status === "EM_VALIDACAO" ? styles.validationCard : ""} ${tarefa.status === "AJUSTES" ? styles.adjustmentCard : ""} ${dragging?.type === "task" && dragging.id === String(tarefa.id) ? styles.dragging : ""}`}
                    data-task-id={tarefa.id}
                    draggable
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      startTouchDrag(event, "task", String(tarefa.id));
                    }}
                    onPointerMove={moveTouchDrag}
                    onPointerUp={endTouchDrag}
                    onPointerCancel={endTouchDrag}
                    onDragStart={(event) => {
                      event.stopPropagation();
                      event.dataTransfer.setData("task", String(tarefa.id));
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const id = Number(event.dataTransfer.getData("task"));
                      const moved = tarefas.find((task) => task.id === id);
                      const rect = event.currentTarget.getBoundingClientRect();
                      const after = event.clientY > rect.top + rect.height / 2;
                      if (moved) void moveTask(moved, coluna.nome, tarefa.id, after);
                    }}
                    onClick={(event) => {
                      if (ignoreClick.current) {
                        event.preventDefault();
                        return;
                      }
                      openTask(tarefa);
                    }}
                  >
                    <strong>{tarefa.nome}</strong>
                    {tarefa.status === "EM_VALIDACAO" && <em className={styles.taskStatus}>Aguardando validação</em>}
                    {tarefa.status === "AJUSTES" && <em className={styles.taskStatus}>Ajustes solicitados</em>}
                    {tarefa.status === "APROVADA" && <em className={styles.taskStatus}>Concluída</em>}
                    <div className={styles.cardFooter}>
                      <div className={styles.cardMeta}>
                        {tarefa.descricao && (
                          <span title="Com descrição">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 6h16" />
                              <path d="M4 12h16" />
                              <path d="M4 18h10" />
                            </svg>
                          </span>
                        )}
                        {tarefa.prazo && (
                          <span title={formatDateOnly(tarefa.prazo)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M12 7v5l3 2" />
                            </svg>
                          </span>
                        )}
                        {attachmentCount(tarefa.anexo) > 0 && (
                          <span title="Com anexos">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                            {attachmentCount(tarefa.anexo)}
                          </span>
                        )}
                        {checklistStats(tarefa.checklist).total > 0 && (
                          <span title="Checklist">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 11l3 3L22 4" />
                              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                            {checklistStats(tarefa.checklist).done}/{checklistStats(tarefa.checklist).total}
                          </span>
                        )}
                      </div>
                      {tarefa.responsavel && (
                        <div className={styles.cardMembers}>
                          {tarefa.responsavel.split(",").map((email) => email.trim()).filter(Boolean).slice(0, 3).map((email) => (
                            <span key={email} title={email}>
                              <UserAvatar fotoUrl={equipe?.membros.find((membro) => membro.email === email)?.fotoUrl} email={email} />
                            </span>
                          ))}
                          {tarefa.responsavel.split(",").map((email) => email.trim()).filter(Boolean).length > 3 && <span>+</span>}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              {isLeader && newTaskColumn === coluna.nome ? (
                <form className={styles.inlineForm} onSubmit={(event) => createTask(event, coluna.nome)}>
                  <input
                    value={newTaskName}
                    onChange={(event) => setNewTaskName(event.target.value)}
                    autoFocus
                    placeholder="Nome da tarefa"
                  />
                  <div>
                    <button type="submit">Criar</button>
                    <button type="button" onClick={() => setNewTaskColumn("")}>Cancelar</button>
                  </div>
                </form>
              ) : isLeader ? (
                <button className={styles.addCard} onClick={() => setNewTaskColumn(coluna.nome)}>
                  + Adicionar tarefa
                </button>
              ) : null}
            </section>
          ))}

          {isLeader && projectColumns.length < 10 && (
            <section className={styles.emptyColumn}>
              {newColumn ? (
                <form className={styles.inlineForm} onSubmit={createColumn}>
                  <input
                    value={newColumnName}
                    onChange={(event) => setNewColumnName(event.target.value)}
                    autoFocus
                    placeholder="Nome da coluna"
                  />
                  <div>
                    <button type="submit">Criar</button>
                    <button type="button" onClick={() => setNewColumn(false)}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setNewColumn(true)}>Criar coluna</button>
              )}
            </section>
          )}

          {isLeader && <div
            className={styles.dropTrash}
            data-trash="true"
            onClick={() => setTrashOpen(true)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const taskId = Number(event.dataTransfer.getData("task"));
              const columnId = event.dataTransfer.getData("column");
              if (taskId) {
                sendToTrash(taskId, "task");
                return;
              }
              if (columnId) askTrashColumn(columnId);
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </div>}
        </div>
      )}

      {selected && (
        <div className={styles.overlay} onClick={closeTask}>
          <div className={styles.modal} onClick={(event) => { event.stopPropagation(); closeFloatingPanels(event); }}>
            <div className={styles.modalHeader}>
              <input
                className={styles.titleInput}
                value={selected.nome}
                disabled={!canEditDetails}
                onChange={(event) => {
                  setSelected({ ...selected, nome: event.target.value });
                  setDirty(true);
                }}
                aria-label="Nome da tarefa"
              />
              <button className={styles.iconBtn} onClick={closeTask} aria-label="Fechar tarefa"><IconX /></button>
            </div>

            <div className={styles.modalGrid}>
              <main className={styles.mainArea}>
                <div className={styles.quickActions}>
                  <div className={styles.quickGroup} data-floating="members">
                    <span>Membros</span>
                    <button className={`${styles.memberButton} ${!canEditDetails ? styles.readOnlyAction : ""}`} disabled={!canEditDetails} onClick={() => setMembersOpen((open) => !open)} aria-label={canEditDetails ? "Adicionar membros" : "Membros atribuídos"}>
                      {selectedMembros.length === 0 && <span className={styles.plusIcon}>{canEditDetails ? "+" : "Nenhum"}</span>}
                      {selectedMembros.slice(0, 4).map((membro) => (
                        <span key={membro.id} className={styles.avatar}>
                          <UserAvatar fotoUrl={membro.fotoUrl} nome={membro.nome} email={membro.email} />
                        </span>
                      ))}
                    </button>
                    {membersOpen && canEditDetails && (
                      <div className={styles.popover}>
                        {availableMembros.length > 0 && <small className={styles.popoverLabel}>Disponíveis</small>}
                        {availableMembros.map((membro) => (
                          <button key={membro.id} className={styles.memberOption} onClick={() => toggleMember(membro.email)}>
                            <span><UserAvatar fotoUrl={membro.fotoUrl} nome={membro.nome} email={membro.email} /></span>
                            <div>
                              <strong>{membro.email.split("@")[0]}{membro.email.toLowerCase() === usuario?.email.toLowerCase() && <small className={styles.self}> (Eu)</small>}</strong>
                              <small>{membro.email}</small>
                            </div>
                            <em>+</em>
                          </button>
                        ))}
                        {selectedMembros.length > 0 && <small className={styles.popoverLabel}>Adicionados</small>}
                        {selectedMembros.map((membro) => (
                          <button key={membro.id} className={styles.memberOption} onClick={() => toggleMember(membro.email)}>
                            <span><UserAvatar fotoUrl={membro.fotoUrl} nome={membro.nome} email={membro.email} /></span>
                            <div>
                              <strong>{membro.email.split("@")[0]}{membro.email.toLowerCase() === usuario?.email.toLowerCase() && <small className={styles.self}> (Eu)</small>}</strong>
                              <small>{membro.email}</small>
                            </div>
                            <em className={styles.removeMember}><IconX size={13} /></em>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={styles.quickGroup} data-floating="date">
                    <span>Data</span>
                    <button className={`${styles.dateButton} ${!canEditDetails ? styles.readOnlyAction : ""}`} disabled={!canEditDetails} onClick={() => setDateOpen((open) => !open)}>
                      {draft.prazo ? `${formatDateOnly(draft.prazo)} ${draft.horaPrazo || ""}` : canEditDetails ? "Definir prazo" : "Sem prazo"}
                    </button>
                    {dateOpen && canEditDetails && (
                      <div className={styles.datePopover}>
                        <label>
                          Data
                          <input type="date" min={today()} value={draft.prazo} onChange={(event) => setDraftValue({ prazo: event.target.value })} />
                        </label>
                        <label>
                          Hora
                          <input type="time" min={draft.prazo === today() ? currentTime() : undefined} value={draft.horaPrazo} onChange={(event) => setDraftValue({ horaPrazo: event.target.value })} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <label>
                  Descrição
                  <textarea
                    className={styles.descriptionField}
                    value={draft.descricao}
                    disabled={!canEditDetails}
                    onChange={(event) => {
                      if (event.target.value.length > 800) {
                        toast.error("A descrição deve ter no máximo 800 caracteres.");
                        return;
                      }
                      setDraftValue({ descricao: event.target.value });
                    }}
                    rows={6}
                  />
                </label>

                <div className={styles.attachmentArea}>
                  <button className={!canEditDetails ? styles.readOnlyAction : ""} onClick={() => setAttachmentsOpen(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                    Anexos
                  </button>
                  {attachments.length > 0 && <span>{attachments.length} arquivo(s)</span>}
                  <span className={styles.charCount}>{draft.descricao.length}/800 caracteres</span>
                </div>

                <section className={styles.checkBlock}>
                  <div className={styles.sectionTitle}>
                    <h3>Checklist</h3>
                    <span>{selectedProgress}%</span>
                  </div>
                  <div className={styles.progressBar}><span style={{ width: `${selectedProgress}%` }} /></div>
                  <div
                    ref={checklistRef}
                    className={`${styles.checkList} ${moreChecklist ? styles.moreBelow : ""}`}
                    onScroll={(event) => setMoreChecklist(event.currentTarget.scrollTop + event.currentTarget.clientHeight < event.currentTarget.scrollHeight - 2)}
                  >
                  {checklist.map((item, index) => (
                    <div
                      key={item.id}
                      className={`${styles.checkItem} ${item.feito ? styles.checkItemDone : ""}`}
                      draggable={canEditDetails}
                      onDragStart={(event) => event.dataTransfer.setData("check", String(index))}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => moveChecklist(Number(event.dataTransfer.getData("check")), index)}
                    >
                      <input
                        type="checkbox"
                        checked={item.feito}
                        disabled={!canInteract}
                        onChange={(event) => toggleChecklist(item.id, event.target.checked)}
                      />
                      <span className={styles.checkText}>
                        <input
                          className={styles.checkTextInput}
                          value={item.texto}
                          disabled={!canEditDetails}
                          onChange={(event) => changeChecklistText(item.id, event.target.value)}
                          onBlur={() => cleanChecklistText(item.id)}
                        />
                        <span className={styles.checkLineText}>{item.texto}</span>
                      </span>
                      {canEditDetails && (
                        <button onClick={() => removeChecklistItem(item.id)} aria-label="Excluir item do checklist">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="m19 6-1 14H6L5 6" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  </div>
                  {canEditDetails && (
                    <div className={styles.addCheck}>
                      <input className={styles.checkTextInput} value={newChecklist} onChange={(event) => setNewChecklist(event.target.value)} placeholder="Novo item" />
                      <button onClick={addChecklistItem} aria-label="Adicionar item ao checklist">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 5v14" />
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                    </div>
                  )}
                </section>
              </main>

              <aside className={styles.sideArea}>
                <section className={styles.comments}>
                  <h3>Comentários</h3>
                  <div
                    ref={commentsRef}
                    className={`${styles.commentList} ${moreComments ? styles.moreBelow : ""}`}
                    onScroll={(event) => setMoreComments(event.currentTarget.scrollTop + event.currentTarget.clientHeight < event.currentTarget.scrollHeight - 2)}
                  >
                    {comments.map((comment) => (
                      <article key={comment.id} className={comment.especial ? styles.specialComment : ""}>
                        <div className={styles.commentMeta}>
                          <strong>{comment.autor}</strong>
                          <span>{formatDate(comment.data)}</span>
                        </div>
                        {editingComment === comment.id ? (
                          <div className={styles.commentEdit}>
                            <input value={commentEditText} onChange={(event) => setCommentEditText(event.target.value)} />
                            <button onClick={() => saveCommentEdit(comment.id)} aria-label="Salvar comentário">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            </button>
                            <button onClick={() => setEditingComment(null)} aria-label="Cancelar edição"><IconX size={14} /></button>
                          </div>
                        ) : (
                          <>
                            <p>{comment.texto}</p>
                            {canEditDetails && (
                              <div className={styles.commentActions}>
                                <button onClick={() => startEditComment(comment)} aria-label="Editar comentário">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                  </svg>
                                </button>
                                <button onClick={() => setDeleteComment(comment)} aria-label="Excluir comentário">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18" />
                                    <path d="M8 6V4h8v2" />
                                    <path d="m19 6-1 14H6L5 6" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </article>
                    ))}
                  </div>
                  {canInteract && (
                    <form onSubmit={(event) => { event.preventDefault(); addComment(); }} className={styles.commentForm}>
                      <input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Escrever comentário" />
                      <button aria-label="Enviar comentário">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 2L11 13" />
                          <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                      </button>
                    </form>
                  )}
                </section>

                {selected.status === "EM_VALIDACAO" && isLeader && (
                  <>
                    <button onClick={() => setApprovalOpen(true)}>Aprovar</button>
                    <button onClick={() => setAdjustOpen(true)}>Solicitar ajustes</button>
                  </>
                )}
                {selected.status !== "EM_VALIDACAO" && selected.status !== "APROVADA" && selected.status !== "AJUSTES" && !isLeader && (
                  <button onClick={submitValidation}>Enviar para validação</button>
                )}
                {selected.status === "EM_VALIDACAO" && !isLeader && (
                  <button onClick={cancelValidation}>Cancelar envio para validação</button>
                )}
                {selected.status === "AJUSTES" && !isLeader && (
                  <button onClick={beginAdjustments}>Iniciar ajustes</button>
                )}
                <div className={styles.saveRow}>
                  {dirty ? (
                    <button className={styles.saveBtn} onClick={() => saveTask()}>Salvar</button>
                  ) : (
                    savedAt && <span>salvo às {formatDate(savedAt)}</span>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}

      {attachmentsOpen && selected && (
        <div className={styles.smallOverlay} onClick={() => setAttachmentsOpen(false)}>
          <div className={styles.attachmentModal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.attachmentHeader}>
              <h3>Anexos</h3>
              <button onClick={() => setAttachmentsOpen(false)} aria-label="Fechar anexos"><IconX /></button>
            </div>
            <div className={styles.fileList}>
              {attachments.length === 0 && <p>Nenhum anexo adicionado.</p>}
              {attachments.map((file) => (
                <div key={file.id} className={styles.fileRow}>
                  <span className={styles[file.tipo.toLowerCase()] ?? ""}>{file.tipo}</span>
                  <strong title={file.nome}>{file.nome}</strong>
                  <button onClick={() => openAttachment(file)} disabled={!file.data} aria-label="Ver anexo">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button onClick={() => downloadAttachment(file)} disabled={!file.data} aria-label="Baixar anexo">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <path d="M7 10l5 5 5-5" />
                      <path d="M12 15V3" />
                    </svg>
                  </button>
                  {isLeader && <button onClick={() => removeAttachment(file.id)} disabled={!canEditDetails} aria-label="Excluir anexo">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="m19 6-1 14H6L5 6" />
                    </svg>
                  </button>}
                </div>
              ))}
            </div>
            {canEditDetails && (
              <label className={styles.uploadButton}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                Adicionar anexo
                <input
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    readFile(file)
                      .then((item) => {
                        setAttachments([...attachments, item]);
                        setDirty(true);
                      })
                      .catch((err) => toast.error(err.message));
                  }}
                />
              </label>
            )}
          </div>
        </div>
      )}

      {adjustOpen && (
        <div className={styles.smallOverlay} onClick={() => setAdjustOpen(false)}>
          <form className={styles.smallModal} onSubmit={requestAdjustments} onClick={(event) => event.stopPropagation()}>
            <h3>Solicitar ajustes</h3>
            <textarea value={adjustText} onChange={(event) => setAdjustText(event.target.value)} rows={4} required />
            <button>Enviar</button>
          </form>
        </div>
      )}

      {approvalOpen && (
        <div className={styles.smallOverlay} onClick={() => setApprovalOpen(false)}>
          <div className={styles.smallModal} onClick={(event) => event.stopPropagation()}>
            <h3>Aprovar tarefa?</h3>
            <p>Depois da aprovação, esta tarefa ficará concluída e disponível apenas para leitura.</p>
            <div className={styles.inlineForm}>
              <button onClick={() => setApprovalOpen(false)}>Cancelar</button>
              <button onClick={approveTask}>Aprovar tarefa</button>
            </div>
          </div>
        </div>
      )}

      {trashOpen && (
        <div className={styles.smallOverlay} onClick={() => setTrashOpen(false)}>
          <div className={styles.trashModal} onClick={(event) => event.stopPropagation()}>
            <h3>Lixeira</h3>
            <div className={styles.trashGrid}>
              <section>
                <h4>Colunas</h4>
                {deletedColumns.length === 0 && <p>Nenhuma coluna excluída.</p>}
                {deletedColumns.map((column) => (
                  <div key={column.id} className={styles.trashItem}>
                    <span>{column.nome}</span>
                    <div>
                      <button onClick={() => openRestoreColumn(column)} aria-label="Restaurar coluna">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 1 0 3-6.7" />
                          <path d="M3 3v6h6" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteColumn(column)} aria-label="Excluir coluna definitivamente">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="m19 6-1 14H6L5 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </section>
              <section>
                <h4>Tarefas</h4>
                {lixeira.length === 0 && <p>Nenhuma tarefa excluída.</p>}
                {lixeira.map((task) => (
                  <div key={task.id} className={styles.trashItem}>
                    <span>{task.nome}</span>
                    <div>
                      <button onClick={() => askRestoreTask(task)} aria-label="Restaurar tarefa">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 1 0 3-6.7" />
                          <path d="M3 3v6h6" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteTask(task)} aria-label="Excluir tarefa definitivamente">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="m19 6-1 14H6L5 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          </div>
        </div>
      )}

      {restoreColumn && (
        <div className={styles.smallOverlay} onClick={() => setRestoreColumn(null)}>
          <div className={styles.smallModal} onClick={(event) => event.stopPropagation()}>
            <h3>Restaurar coluna</h3>
            {restoreColumn.tarefas.map((task) => (
              <label key={task.id} className={styles.memberOption}>
                <input
                  type="checkbox"
                  checked={restoreIds.includes(task.id)}
                  onChange={() => setRestoreIds((ids) => ids.includes(task.id) ? ids.filter((id) => id !== task.id) : [...ids, task.id])}
                />
                {task.nome}
              </label>
            ))}
            <div className={styles.inlineForm}>
              <button onClick={() => restoreDeletedColumn(restoreColumn, restoreIds)}>
                {restoreIds.length === restoreColumn.tarefas.length ? "Restaurar tudo" : "Restaurar selecionadas"}
              </button>
              <button onClick={() => restoreDeletedColumn(restoreColumn, [])}>Restaurar só a coluna</button>
            </div>
          </div>
        </div>
      )}

      {deleteColumn && (
        <div className={styles.smallOverlay} onClick={() => setDeleteColumn(null)}>
          <div className={styles.smallModal} onClick={(event) => event.stopPropagation()}>
            <h3>Excluir definitivamente?</h3>
            <p>Esta coluna sairá da lixeira.</p>
            <div className={styles.inlineForm}>
              <button className={styles.dangerBtn} onClick={() => {
                deleteColumnForever(deleteColumn);
              }}>Excluir</button>
              <button onClick={() => setDeleteColumn(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {deleteTask && (
        <div className={styles.smallOverlay} onClick={() => setDeleteTask(null)}>
          <div className={styles.smallModal} onClick={(event) => event.stopPropagation()}>
            <h3>Excluir definitivamente?</h3>
            <p>Esta tarefa sairá da lixeira.</p>
            <div className={styles.inlineForm}>
              <button className={styles.dangerBtn} onClick={() => deleteTaskForever(deleteTask)}>Excluir</button>
              <button onClick={() => setDeleteTask(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {restoreTask && (
        <div className={styles.smallOverlay} onClick={() => setRestoreTask(null)}>
          <div className={styles.smallModal} onClick={(event) => event.stopPropagation()}>
            <h3>Restaurar tarefa</h3>
            <p>Escolha para qual coluna ela deve voltar.</p>
            {restoreColumns.length === 0 ? (
              <p>Restaure ou crie uma coluna antes de restaurar esta tarefa.</p>
            ) : (
              <select value={restoreTaskColumn} onChange={(event) => setRestoreTaskColumn(event.target.value)}>
                {restoreColumns.map((column) => (
                  <option key={column.id} value={column.nome}>{column.nome}</option>
                ))}
              </select>
            )}
            <div className={styles.inlineForm}>
              <button disabled={!restoreTaskColumn} onClick={() => restoreDeletedTask(restoreTask, restoreTaskColumn)}>Restaurar</button>
              <button onClick={() => setRestoreTask(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {deleteComment && (
        <div className={styles.smallOverlay} onClick={() => setDeleteComment(null)}>
          <div className={styles.smallModal} onClick={(event) => event.stopPropagation()}>
            <h3>Excluir comentário?</h3>
            <p>Esta ação não poderá ser desfeita depois que a tarefa for salva.</p>
            <div className={styles.inlineForm}>
              <button onClick={() => setDeleteComment(null)}>Cancelar</button>
              <button className={styles.dangerBtn} onClick={() => {
                void removeComment(deleteComment.id);
                setDeleteComment(null);
              }}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {confirmClose && (
        <div className={styles.smallOverlay} onClick={() => setConfirmClose(false)}>
          <div className={styles.smallModal} onClick={(event) => event.stopPropagation()}>
            <h3>Sair sem salvar?</h3>
            <p>As alterações feitas nesta tarefa serão perdidas.</p>
            <div className={styles.inlineForm}>
              <button onClick={() => {
                setConfirmClose(false);
                setSelected(null);
                setDirty(false);
                setEditingComment(null);
                setCommentEditText("");
                setDeleteComment(null);
              }}>Descartar</button>
              <button onClick={() => setConfirmClose(false)}>Continuar editando</button>
            </div>
          </div>
        </div>
      )}

      {trashColumn && (
        <div className={styles.smallOverlay} onClick={() => setTrashColumn(null)}>
          <div className={styles.smallModal} onClick={(event) => event.stopPropagation()}>
            <h3>Excluir coluna?</h3>
            <p>As tarefas desta coluna também serão enviadas para a lixeira.</p>
            <div className={styles.inlineForm}>
              <button onClick={() => setTrashColumn(null)}>Cancelar</button>
              <button onClick={() => {
                void sendToTrash(trashColumn.id, "column");
                setTrashColumn(null);
              }}>Enviar para lixeira</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

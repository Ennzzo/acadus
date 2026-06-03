"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { clearSelectedProjectId, getCurrentUser, getSelectedProjectId, setSelectedProjectId, withUser } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { Projeto } from "@/types/projeto";
import ProjectsHeader from "@/components/projetos/ProjectsHeader";
import ProjectsToolbar, { ProjectViewMode, SortBy } from "@/components/projetos/ProjectsToolbar";
import ProjectList from "@/components/projetos/ProjectList";
import ProjectFormModal, { ProjectFormData } from "@/components/projetos/ProjectFormModal";
import ProjectDeleteModal from "@/components/projetos/ProjectDeleteModal";
import ProjectLeaveModal from "@/components/projetos/ProjectLeaveModal";
import styles from "./styles.module.css";

type ModalState =
  | { type: "none" }
  | { type: "criar" }
  | { type: "editar"; projeto: Projeto }
  | { type: "excluir"; projeto: Projeto }
  | { type: "sair"; projeto: Projeto };

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("nome");
  const [viewMode, setViewMode] = useState<ProjectViewMode>("cards");
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const usuario = getCurrentUser();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiFetch<Projeto[]>(withUser("/projetos"), { cache: "no-store" });
        setProjetos(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar projetos.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const projetosOrdenados = [...projetos].sort((a, b) =>
      sortBy === "nome"
        ? a.nomeProjeto.localeCompare(b.nomeProjeto, "pt-BR")
        : a.dataCriacao.localeCompare(b.dataCriacao)
  );

  async function criarProjeto(dados: ProjectFormData) {
    const usuario = getCurrentUser();
    if (!usuario) {
      throw new Error("Faça login para criar projetos.");
    }

    const payload = {
      nomeProjeto: dados.nome,
      descricao: dados.descricao || null,
      liderEmail: usuario.email,
      status: dados.status,
      capaUrl: dados.capaUrl,
    };
    const created = await apiFetch<Projeto>("/projetos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setProjetos((prev) => [...prev, created]);
    setSelectedProjectId(created.id);
    toast.success("Projeto criado.");
  }

  async function editarProjeto(dados: ProjectFormData) {
    if (modal.type !== "editar") return;
    const payload = {
      nomeProjeto: dados.nome,
      descricao: dados.descricao || null,
      status: dados.status,
      capaUrl: dados.capaUrl,
    };
    const updated = await apiFetch<Projeto>(withUser(`/projetos/${modal.projeto.id}`), {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    setProjetos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    toast.success("Projeto atualizado.");
  }

  async function excluirProjeto() {
    if (modal.type !== "excluir") return;
    await apiFetch(withUser(`/projetos/${modal.projeto.id}`), { method: "DELETE" });
    setProjetos((prev) => {
      const next = prev.filter((p) => p.id !== modal.projeto.id);
      if (getSelectedProjectId() === modal.projeto.id && next[0]) {
        setSelectedProjectId(next[0].id);
      }
      return next;
    });
    toast.success("Projeto excluído.");
  }

  async function sairProjeto() {
    if (modal.type !== "sair") return;
    await apiFetch(withUser(`/projetos/${modal.projeto.id}/sair`), { method: "PUT" });
    setProjetos((prev) => {
      const next = prev.filter((projeto) => projeto.id !== modal.projeto.id);
      const first = next[0];
      if (getSelectedProjectId() === modal.projeto.id) {
        if (first) setSelectedProjectId(first.id);
        else clearSelectedProjectId();
      }
      return next;
    });
    toast.success("Você saiu do projeto.");
  }

  return (
    <>
      <div className={styles.page}>
        <ProjectsHeader
          projetos={projetos}
          onNewProject={() => setModal({ type: "criar" })}
        />
        <ProjectsToolbar
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          total={projetos.length}
        />
        <div className={styles.content}>
          {loading ? (
            <span>Carregando projetos...</span>
          ) : error ? (
            <span>{error}</span>
          ) : (
            <ProjectList
              projetos={projetosOrdenados}
              view={viewMode}
              onEdit={(p) => setModal({ type: "editar", projeto: p })}
              onDelete={(p) => setModal({ type: "excluir", projeto: p })}
              onLeave={(p) => setModal({ type: "sair", projeto: p })}
              currentUserEmail={usuario?.email}
            />
          )}
        </div>
      </div>

      {modal.type === "criar" && (
        <ProjectFormModal
          mode="criar"
          onClose={() => setModal({ type: "none" })}
          onSave={criarProjeto}
        />
      )}

      {modal.type === "editar" && (
        <ProjectFormModal
          mode="editar"
          projeto={modal.projeto}
          onClose={() => setModal({ type: "none" })}
          onSave={editarProjeto}
        />
      )}

      {modal.type === "excluir" && (
        <ProjectDeleteModal
          projeto={modal.projeto}
          onClose={() => setModal({ type: "none" })}
          onConfirm={excluirProjeto}
        />
      )}

      {modal.type === "sair" && (
        <ProjectLeaveModal
          projeto={modal.projeto}
          onClose={() => setModal({ type: "none" })}
          onConfirm={sairProjeto}
        />
      )}
    </>
  );
}

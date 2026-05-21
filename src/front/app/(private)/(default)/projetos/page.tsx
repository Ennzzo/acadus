"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Projeto, StatusProjeto } from "@/types/projeto";
import ProjectsHeader from "@/components/projetos/ProjectsHeader";
import ProjectsToolbar, { ProjectViewMode, SortBy } from "@/components/projetos/ProjectsToolbar";
import ProjectList from "@/components/projetos/ProjectList";
import ProjectFormModal from "@/components/projetos/ProjectFormModal";
import ProjectDeleteModal from "@/components/projetos/ProjectDeleteModal";
import styles from "./styles.module.css";

type ModalState =
  | { type: "none" }
  | { type: "criar" }
  | { type: "editar"; projeto: Projeto }
  | { type: "excluir"; projeto: Projeto };

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusProjeto | "TODOS">("TODOS");
  const [sortBy, setSortBy] = useState<SortBy>("nome");
  const [viewMode, setViewMode] = useState<ProjectViewMode>("cards");
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiFetch<Projeto[]>("/projetos", { cache: "no-store" });
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

  const busca = query.trim().toLowerCase();
  const projetosFiltrados = projetos
    .filter((projeto) => statusFilter === "TODOS" || projeto.status === statusFilter)
    .filter((projeto) => {
      if (!busca) return true;
      return (
        projeto.nomeProjeto.toLowerCase().includes(busca) ||
        (projeto.descricao ?? "").toLowerCase().includes(busca)
      );
    })
    .sort((a, b) =>
      sortBy === "nome"
        ? a.nomeProjeto.localeCompare(b.nomeProjeto, "pt-BR")
        : a.dataCriacao.localeCompare(b.dataCriacao)
    );

  function handleClear() {
    setQuery("");
    setStatusFilter("TODOS");
    setSortBy("nome");
  }

  async function criarProjeto(dados: { nome: string; descricao: string }) {
    const payload = { nomeProjeto: dados.nome, descricao: dados.descricao || null };
    const created = await apiFetch<Projeto>("/projetos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setProjetos((prev) => [...prev, created]);
  }

  async function editarProjeto(dados: { nome: string; descricao: string }) {
    if (modal.type !== "editar") return;
    const payload = { nomeProjeto: dados.nome, descricao: dados.descricao || null };
    const updated = await apiFetch<Projeto>(`/projetos/${modal.projeto.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    setProjetos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  async function excluirProjeto() {
    if (modal.type !== "excluir") return;
    await apiFetch(`/projetos/${modal.projeto.id}`, { method: "DELETE" });
    setProjetos((prev) => prev.filter((p) => p.id !== modal.projeto.id));
  }

  return (
    <>
      <div className={styles.page}>
        <ProjectsHeader
          projetos={projetos}
          onNewProject={() => setModal({ type: "criar" })}
        />
        <ProjectsToolbar
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          total={projetos.length}
          filtered={projetosFiltrados.length}
        />
        <div className={styles.content}>
          {loading ? (
            <span>Carregando projetos...</span>
          ) : error ? (
            <span>{error}</span>
          ) : (
            <ProjectList
              projetos={projetosFiltrados}
              view={viewMode}
              onClearFilters={handleClear}
              query={query}
              onEdit={(p) => setModal({ type: "editar", projeto: p })}
              onDelete={(p) => setModal({ type: "excluir", projeto: p })}
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
    </>
  );
}

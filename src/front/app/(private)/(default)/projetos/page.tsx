"use client";

import { useMemo, useState } from "react";
import { projetosMock } from "@/data/mocks/projetos";
import { Projeto, StatusProjeto } from "@/types/projeto";
import ProjectsHeader from "@/components/projetos/ProjectsHeader";
import ProjectsToolbar from "@/components/projetos/ProjectsToolbar";
import { ProjectViewMode } from "@/components/projetos/ProjectsToolbar";
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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusProjeto | "TODOS">("TODOS");
  const [sortBy, setSortBy] = useState<"nome" | "prazo" | "progresso">("nome");
  const [viewMode, setViewMode] = useState<ProjectViewMode>("cards");
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  const projetosFiltrados = useMemo(() => {
    let list = [...projetosMock];

    if (statusFilter !== "TODOS") {
      list = list.filter((p) => p.status === statusFilter);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          p.disciplina.toLowerCase().includes(q) ||
          p.professor.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === "nome") return a.nome.localeCompare(b.nome, "pt-BR");
      if (sortBy === "prazo") return a.dataEntrega.localeCompare(b.dataEntrega);
      if (sortBy === "progresso") return b.progresso - a.progresso;
      return 0;
    });

    return list;
  }, [query, statusFilter, sortBy]);

  function handleClear() {
    setQuery("");
    setStatusFilter("TODOS");
    setSortBy("nome");
  }

  function handleSaveProjeto(dados: { nome: string; descricao: string }) {
    // TODO: integrar com API — por ora apenas fecha o modal
    console.log("Salvar projeto:", dados);
  }

  function handleSaveEdicao(dados: { nome: string; descricao: string }) {
    // TODO: integrar com API — por ora apenas fecha o modal
    console.log("Salvar edição:", dados);
  }

  function handleConfirmarExclusao() {
    // TODO: integrar com API — por ora apenas fecha o modal
    console.log("Excluir projeto:", modal);
  }

  return (
    <>
      <div className={styles.page}>
        <ProjectsHeader
          projetos={projetosMock}
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
          total={projetosMock.length}
          filtered={projetosFiltrados.length}
        />
        <div className={styles.content}>
          <ProjectList
            projetos={projetosFiltrados}
            view={viewMode}
            onClearFilters={handleClear}
            query={query}
            onEdit={(p) => setModal({ type: "editar", projeto: p })}
            onDelete={(p) => setModal({ type: "excluir", projeto: p })}
          />
        </div>
      </div>

      {/* Modal: Criar projeto */}
      {modal.type === "criar" && (
        <ProjectFormModal
          mode="criar"
          onClose={() => setModal({ type: "none" })}
          onSave={handleSaveProjeto}
        />
      )}

      {/* Modal: Editar projeto */}
      {modal.type === "editar" && (
        <ProjectFormModal
          mode="editar"
          projeto={modal.projeto}
          onClose={() => setModal({ type: "none" })}
          onSave={handleSaveEdicao}
        />
      )}

      {/* Modal: Excluir projeto */}
      {modal.type === "excluir" && (
        <ProjectDeleteModal
          projeto={modal.projeto}
          onClose={() => setModal({ type: "none" })}
          onConfirm={handleConfirmarExclusao}
        />
      )}
    </>
  );
}



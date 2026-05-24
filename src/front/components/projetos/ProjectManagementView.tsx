"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import ProjectDetailOverview from "@/components/projetos/ProjectDetailOverview";
import { Projeto } from "@/types/projeto";
import ProjectFormModal, { ProjectFormData } from "./ProjectFormModal";
import styles from "./ProjectManagementView.module.css";

interface ProjectManagementViewProps {
  projeto: Projeto;
}

export default function ProjectManagementView({ projeto }: ProjectManagementViewProps) {
  const [current, setCurrent] = useState(projeto);
  const [editing, setEditing] = useState(false);

  async function saveProject(dados: ProjectFormData) {
    const updated = await apiFetch<Projeto>(`/projetos/${current.id}`, {
      method: "PUT",
      body: JSON.stringify({
        nomeProjeto: dados.nome,
        descricao: dados.descricao || null,
        status: dados.status,
        capaUrl: dados.capaUrl,
      }),
    });

    setCurrent(updated);
    toast.success("Projeto atualizado.");
  }

  return (
    <div className={styles.container}>
      <ProjectDetailOverview projeto={current} onEdit={() => setEditing(true)} />

      {editing && (
        <ProjectFormModal
          mode="editar"
          projeto={current}
          onClose={() => setEditing(false)}
          onSave={saveProject}
        />
      )}
    </div>
  );
}

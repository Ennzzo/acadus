"use client";

import { useState } from "react";
import ProjectViewTabs, { ProjectView } from "@/components/projetos/ProjectViewTabs";
import ProjectDetailOverview from "@/components/projetos/ProjectDetailOverview";
import ProjectTeam from "@/components/projetos/ProjectTeam";
import ProjectTasks from "@/components/projetos/ProjectTasks";
import { Projeto } from "@/types/projeto";
import styles from "./ProjectManagementView.module.css";

interface ProjectManagementViewProps {
  projeto: Projeto;
}

export default function ProjectManagementView({ projeto }: ProjectManagementViewProps) {
  const [view, setView] = useState<ProjectView>("overview");

  return (
    <div className={styles.container}>
      <ProjectViewTabs activeView={view} onChange={setView} />

      {view === "overview" && (
        <ProjectDetailOverview projeto={projeto} />
      )}

      {view === "equipe" && (
        <ProjectTeam projetoId={projeto.id} />
      )}

      {view === "tarefas" && (
        <ProjectTasks projetoId={projeto.id} />
      )}
    </div>
  );
}

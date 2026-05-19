"use client";

import { useState } from "react";
import ProjectViewTabs, { ProjectView } from "@/components/projetos/ProjectViewTabs";
import ProjectDetailOverview from "@/components/projetos/ProjectDetailOverview";
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

      {view === "quadro" && (
        <div className={styles.placeholder}>
          <span>Vista de Quadro — em breve</span>
        </div>
      )}

      {view === "calendario" && (
        <div className={styles.placeholder}>
          <span>Vista de Calendário — em breve</span>
        </div>
      )}

      {view === "gantt" && (
        <div className={styles.placeholder}>
          <span>Vista de Gantt — em breve</span>
        </div>
      )}

      {view === "tabela" && (
        <div className={styles.placeholder}>
          <span>Vista de Tabela — em breve</span>
        </div>
      )}
    </div>
  );
}


"use client";

import styles from "./ProjectViewTabs.module.css";

export type ProjectView = "overview" | "equipe" | "tarefas";

const tabs: { key: ProjectView; label: string }[] = [
  { key: "overview", label: "Visão geral" },
  { key: "equipe", label: "Equipe" },
  { key: "tarefas", label: "Tarefas" },
];

interface ProjectViewTabsProps {
  activeView: ProjectView;
  onChange: (view: ProjectView) => void;
}

export default function ProjectViewTabs({ activeView, onChange }: ProjectViewTabsProps) {
  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tab} ${activeView === tab.key ? styles.active : ""}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

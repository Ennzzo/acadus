"use client";

import { useState } from "react";
import styles from "./ProjectViewTabs.module.css";

export type ProjectView = "overview" | "quadro" | "calendario" | "gantt" | "tabela";

const tabs: { key: ProjectView; label: string; icon?: React.ReactNode }[] = [
  {
    key: "overview",
    label: "Overview",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    key: "quadro",
    label: "Quadro",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
  },
  {
    key: "calendario",
    label: "Calendário",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    key: "gantt",
    label: "Gantt",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="13" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="16" y2="18" />
      </svg>
    ),
  },
  {
    key: "tabela",
    label: "Tabela",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" />
      </svg>
    ),
  },
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
          {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
      <button className={styles.addTab}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Visualização
      </button>
    </div>
  );
}

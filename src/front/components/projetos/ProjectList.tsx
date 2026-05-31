import { Projeto } from "@/types/projeto";
import ProjectCard from "./ProjectCard";
import ProjectsTableView from "./ProjectsTableView";
import ProjectsEmptyState from "./ProjectsEmptyState";
import styles from "./ProjectList.module.css";

interface ProjectListProps {
  projetos: Projeto[];
  view: "cards" | "tabela";
  onEdit: (projeto: Projeto) => void;
  onDelete: (projeto: Projeto) => void;
  onLeave: (projeto: Projeto) => void;
  currentUserEmail?: string;
}

export default function ProjectList({
  projetos,
  view,
  onEdit,
  onDelete,
  onLeave,
  currentUserEmail,
}: ProjectListProps) {
  if (projetos.length === 0) {
    return <ProjectsEmptyState />;
  }

  if (view === "tabela") {
    return <ProjectsTableView projetos={projetos} onLeave={onLeave} currentUserEmail={currentUserEmail} />;
  }

  return (
    <ul className={styles.grid}>
      {projetos.map((projeto) => (
        <li key={projeto.id}>
          <ProjectCard
            projeto={projeto}
            onEdit={projeto.liderEmail === currentUserEmail ? onEdit : undefined}
            onDelete={projeto.liderEmail === currentUserEmail ? onDelete : undefined}
            onLeave={projeto.liderEmail !== currentUserEmail ? onLeave : undefined}
          />
        </li>
      ))}
    </ul>
  );
}

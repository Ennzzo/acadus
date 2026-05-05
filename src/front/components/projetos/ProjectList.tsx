import { Projeto } from "@/types/projeto";
import ProjectCard from "./ProjectCard";
import ProjectsTableView from "./ProjectsTableView";
import ProjectsEmptyState from "./ProjectsEmptyState";
import styles from "./ProjectList.module.css";

interface ProjectListProps {
  projetos: Projeto[];
  view: "cards" | "tabela";
  onClearFilters: () => void;
  query: string;
  onEdit: (projeto: Projeto) => void;
  onDelete: (projeto: Projeto) => void;
}

export default function ProjectList({
  projetos,
  view,
  onClearFilters,
  query,
  onEdit,
  onDelete,
}: ProjectListProps) {
  if (projetos.length === 0) {
    return <ProjectsEmptyState query={query} onClear={onClearFilters} />;
  }

  if (view === "tabela") {
    return <ProjectsTableView projetos={projetos} />;
  }

  return (
    <ul className={styles.grid}>
      {projetos.map((projeto) => (
        <li key={projeto.id}>
          <ProjectCard projeto={projeto} onEdit={onEdit} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}



import { Projeto } from "@/types/projeto";
import ProjectCard from "./ProjectCard";
import styles from "./ProjectList.module.css";

interface ProjectListProps {
  projetos: Projeto[];
}

export default function ProjectList({ projetos }: ProjectListProps) {
  if (projetos.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>Nenhum projeto encontrado.</p>
      </div>
    );
  }

  return (
    <ul className={styles.grid}>
      {projetos.map((projeto) => (
        <li key={projeto.id}>
          <ProjectCard projeto={projeto} />
        </li>
      ))}
    </ul>
  );
}

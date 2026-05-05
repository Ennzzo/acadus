import { projetosMock } from "@/data/mocks/projetos";
import ProjectsHeader from "@/components/projetos/ProjectsHeader";
import ProjectList from "@/components/projetos/ProjectList";
import styles from "./styles.module.css";

export default function ProjetosPage() {
  return (
    <div className={styles.page}>
      <ProjectsHeader total={projetosMock.length} />
      <div className={styles.content}>
        <ProjectList projetos={projetosMock} />
      </div>
    </div>
  );
}

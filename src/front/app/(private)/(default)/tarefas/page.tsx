"use client";

import ProjectTasks from "@/components/projetos/ProjectTasks";
import ProjectWorkspace from "@/components/projetos/ProjectWorkspace";

export default function TarefasPage() {
  return (
    <ProjectWorkspace title="Gerenciamento de tarefas">
      {(projeto) => <ProjectTasks projetoId={projeto.id} />}
    </ProjectWorkspace>
  );
}

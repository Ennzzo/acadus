"use client";

import ProjectTeam from "@/components/projetos/ProjectTeam";
import ProjectWorkspace from "@/components/projetos/ProjectWorkspace";

export default function EquipesPage() {
  return (
    <ProjectWorkspace title="Equipe">
      {(projeto) => <ProjectTeam projetoId={projeto.id} />}
    </ProjectWorkspace>
  );
}

import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Projeto } from "@/types/projeto";
import ProjectPageHeader from "@/components/projetos/ProjectPageHeader";
import ProjectManagementView from "@/components/projetos/ProjectManagementView";
import styles from "./styles.module.css";

interface Props {
  params: { id: string };
}

export default async function ProjetoDetailPage({ params }: Props) {
  let projeto: Projeto | null = null;

  try {
    projeto = await apiFetch<Projeto>(`/projetos/${params.id}`, { cache: "no-store" });
  } catch {
    notFound();
  }

  if (!projeto) notFound();

  return (
    <div className={styles.page}>
      <ProjectPageHeader
        espaco="Projetos"
        nome={projeto.nomeProjeto}
        projetoId={String(projeto.id)}
      />
      <ProjectManagementView projeto={projeto} />
    </div>
  );
}


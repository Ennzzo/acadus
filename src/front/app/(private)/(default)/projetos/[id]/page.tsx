import { notFound } from "next/navigation";
import { getProjetoDetalhe } from "@/data/mocks/projetosDetalhe";
import ProjectPageHeader from "@/components/projetos/ProjectPageHeader";
import ProjectManagementView from "@/components/projetos/ProjectManagementView";
import styles from "./styles.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjetoDetailPage({ params }: Props) {
  const { id } = await params;
  const projeto = getProjetoDetalhe(id);

  if (!projeto) notFound();

  return (
    <div className={styles.page}>
      <ProjectPageHeader
        espaco={projeto.espaco}
        nome={projeto.nome}
        projetoId={projeto.id}
      />
      <ProjectManagementView projeto={projeto} />
    </div>
  );
}


"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { setSelectedProjectId, withUser } from "@/lib/auth";
import { Projeto } from "@/types/projeto";
import ProjectPageHeader from "@/components/projetos/ProjectPageHeader";
import ProjectManagementView from "@/components/projetos/ProjectManagementView";
import styles from "./styles.module.css";

export default function ProjetoDetailPage() {
  const params = useParams<{ id: string }>();
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiFetch<Projeto>(withUser(`/projetos/${params.id}`), { cache: "no-store" });
        setProjeto(data);
        setSelectedProjectId(data.id);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível abrir o projeto.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles.state}>
        Carregando projeto...
      </div>
    );
  }

  if (error || !projeto) {
    return (
      <div className={styles.state}>
        <h1>Projeto não encontrado</h1>
        <p>{error || "Verifique se o back-end está rodando e tente novamente."}</p>
        <Link href="/projetos">Voltar para projetos</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <ProjectPageHeader
        espaco="Projetos"
        nome={projeto.nomeProjeto}
      />
      <ProjectManagementView projeto={projeto} />
    </div>
  );
}

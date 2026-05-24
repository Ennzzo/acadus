"use client";

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getSelectedProjectId, setSelectedProjectId } from "@/lib/auth";
import { Projeto } from "@/types/projeto";
import styles from "./ProjectWorkspace.module.css";

interface ProjectWorkspaceProps {
  title: string;
  children: (projeto: Projeto) => ReactNode;
}

export default function ProjectWorkspace({ title, children }: ProjectWorkspaceProps) {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiFetch<Projeto[]>("/projetos", { cache: "no-store" });
        setProjetos(data);

        const savedId = getSelectedProjectId();
        const saved = data.find((projeto) => projeto.id === savedId);
        const first = saved ?? data[0] ?? null;

        if (first) {
          setSelectedId(first.id);
          setSelectedProjectId(first.id);
        }

        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível carregar os projetos.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const projeto = useMemo(
    () => projetos.find((item) => item.id === selectedId) ?? projetos[0],
    [projetos, selectedId],
  );

  function changeProject(value: string) {
    const id = Number(value);
    setSelectedId(id);
    setSelectedProjectId(id);
  }

  if (loading) {
    return <div className={styles.state}>Carregando projetos...</div>;
  }

  if (error) {
    return <div className={styles.state}>{error}</div>;
  }

  if (!projeto) {
    return (
      <div className={styles.empty}>
        <h1>Nenhum projeto encontrado</h1>
        <p>Crie um projeto para acessar equipe, tarefas, chat e notificações.</p>
        <Link href="/projetos">Ir para projetos</Link>
      </div>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{title}</h1>
          <p>{projeto.nomeProjeto}</p>
        </div>
        <label className={styles.selectLabel}>
          Projeto
          <select value={projeto.id} onChange={(event) => changeProject(event.target.value)}>
            {projetos.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nomeProjeto}
              </option>
            ))}
          </select>
        </label>
      </header>
      <div className={styles.content}>{children(projeto)}</div>
    </section>
  );
}

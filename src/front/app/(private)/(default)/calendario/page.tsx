"use client";

import { useState, useEffect } from "react";
import { getSelectedProjectId, setSelectedProjectId, withUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import { ProjetoComStatus } from "@/types/projeto";
import CalendarView from "@/components/calendario/CalendarView";
import styles from "./styles.module.css";

function getNomeProjeto(projeto: ProjetoComStatus) {
  return projeto.nomeProjeto || projeto.nome || "Projeto sem nome";
}

function deduplicarProjetos(projetos: ProjetoComStatus[]) {
  return Array.from(new Map(projetos.map((projeto) => [projeto.id, projeto])).values());
}

export default function CalendarioPage() {
  const [projetos, setProjetos] = useState<ProjetoComStatus[]>([]);
  const [projetoId, setProjetoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarProjetos() {
      try {
        setLoading(true);
        const data = await apiFetch<ProjetoComStatus[]>(
          withUser("/projetos/usuario"),
          { cache: "no-store" }
        );
        const projetosUnicos = deduplicarProjetos(data);
        const salvo = getSelectedProjectId();
        const selecionado = projetosUnicos.find((projeto) => projeto.id === salvo) ?? projetosUnicos[0];
        setProjetos(projetosUnicos);
        if (selecionado) {
          setProjetoId(selecionado.id);
        }
      } catch {
        toast.error("Erro ao carregar projetos");
        setProjetos([]);
      } finally {
        setLoading(false);
      }
    }

    carregarProjetos();
  }, []);

  const projetoAtual = projetos.find((p) => p.id === projetoId) || projetos[0];
  const isLeader = projetoAtual?.statusUsuario === "CRIADOR";

  function selecionarProjeto(id: number) {
    setProjetoId(id);
    setSelectedProjectId(id);
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <p>Carregando projetos...</p>
        </div>
      </div>
    );
  }

  if (projetos.length === 0) {
    return (
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1 className={styles.headerTitle}>Calendário</h1>
        </header>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <p>Você não possui projetos. Crie um para visualizar o calendário.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.headerTitle}>Calendário</h1>
        <div className={styles.projetoSelector}>
          <label htmlFor="projeto-select">Projeto</label>
          <select
            id="projeto-select"
            value={projetoId || ""}
            onChange={(e) => selecionarProjeto(Number(e.target.value))}
            className={styles.select}
          >
            {projetos.map((projeto) => (
              <option key={projeto.id} value={projeto.id}>
                {getNomeProjeto(projeto)} {projeto.statusUsuario === "CRIADOR" ? "(Líder)" : "(Membro)"}
              </option>
            ))}
          </select>
        </div>
      </header>
      <div className={styles.calendarWrapper}>
        {projetoId && (
          <CalendarView
            projetoId={projetoId}
            isLeader={isLeader}
          />
        )}
      </div>
    </div>
  );
}

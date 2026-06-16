"use client";

import { useState, useEffect } from "react";
import { withUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import { ProjetoComStatus } from "@/types/projeto";
import CalendarView from "@/components/calendario/CalendarView";
import styles from "./styles.module.css";

// Mock responsáveis - substituir por API real
const RESPONSAVEIS_MOCK: Record<number, string> = {
  1: "João Silva",
  2: "Maria Santos",
  3: "Pedro Oliveira",
  4: "Ana Costa",
};

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
        setProjetos(data);
        if (data.length > 0) {
          setProjetoId(data[0].id);
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
          <div className={styles.headerIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
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
        <div className={styles.headerIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div>
          <h1 className={styles.headerTitle}>Calendário</h1>
          <div className={styles.equipeSelector}>
            <label htmlFor="projeto-select">Projeto:</label>
            <select
              id="projeto-select"
              value={projetoId || ""}
              onChange={(e) => setProjetoId(Number(e.target.value))}
              className={styles.select}
            >
              {projetos.map((projeto) => (
                <option key={projeto.id} value={projeto.id}>
                  {projeto.nomeProjeto} {projeto.statusUsuario === "CRIADOR" ? "(Líder)" : "(Membro)"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>
      <div className={styles.calendarWrapper}>
        {projetoId && (
          <CalendarView
            projetoId={projetoId}
            isLeader={isLeader}
            responsaveisMap={RESPONSAVEIS_MOCK}
          />
        )}
      </div>
    </div>
  );
}

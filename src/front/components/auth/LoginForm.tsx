"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setCurrentUser } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { Usuario } from "@/types/usuario";
import styles from "./LoginForm.module.css";
import type { Tab } from "./LoginCard";

interface LoginFormProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function LoginForm({ tab, onTabChange }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [termos, setTermos] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm(nextTab: Tab) {
    setError("");
    setNome("");
    setSobrenome("");
    setEmail("");
    setSenha("");
    setConfirmar("");
    setTermos(false);
    onTabChange(nextTab);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (tab === "cadastrar") {
      if (senha !== confirmar) {
        setError("As senhas precisam ser iguais.");
        toast.error("As senhas precisam ser iguais.");
        return;
      }

      if (!termos) {
        setError("Aceite os termos para criar a conta.");
        toast.error("Aceite os termos para criar a conta.");
        return;
      }
    }

    try {
      setLoading(true);
      const usuario = tab === "entrar"
        ? await apiFetch<Usuario>("/usuarios/login", {
            method: "POST",
            body: JSON.stringify({ email, senha }),
          })
        : await apiFetch<Usuario>("/usuarios", {
            method: "POST",
            body: JSON.stringify({ nome, sobrenome, email, senha }),
          });

      setCurrentUser(usuario);
      toast.success(tab === "entrar" ? "Login realizado." : "Conta criada.");
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível continuar.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>
        {tab === "entrar" ? "Entrar" : "Criar conta"}
      </h1>
      <p className={styles.subtitle}>
        {tab === "entrar"
          ? "Use seu e-mail e senha para acessar seus projetos."
          : "Preencha os dados do cadastro para começar."}
      </p>

      <div className={styles.tabs}>
        <button
          type="button"
          className={tab === "entrar" ? styles.tabActive : styles.tab}
          onClick={() => resetForm("entrar")}
        >
          Entrar
        </button>
        <button
          type="button"
          className={tab === "cadastrar" ? styles.tabActive : styles.tab}
          onClick={() => resetForm("cadastrar")}
        >
          Cadastrar
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {tab === "cadastrar" && (
          <div className={styles.twoCols}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="nome">
                Nome
              </label>
              <input
                id="nome"
                type="text"
                className={styles.input}
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                autoComplete="given-name"
                maxLength={100}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="sobrenome">
                Sobrenome
              </label>
              <input
                id="sobrenome"
                type="text"
                className={styles.input}
                value={sobrenome}
                onChange={(event) => setSobrenome(event.target.value)}
                autoComplete="family-name"
                maxLength={100}
                required
              />
            </div>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            maxLength={150}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="senha">
            Senha
          </label>
          <div className={styles.inputRow}>
            <input
              id="senha"
              type={showPassword ? "text" : "password"}
              className={styles.input}
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              autoComplete={
                tab === "entrar" ? "current-password" : "new-password"
              }
              minLength={tab === "cadastrar" ? 6 : undefined}
              required
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {tab === "cadastrar" && (
          <>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirmar">
                Confirmar senha
              </label>
              <div className={styles.inputRow}>
                <input
                id="confirmar"
                type={showConfirm ? "text" : "password"}
                className={styles.input}
                value={confirmar}
                onChange={(event) => setConfirmar(event.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showConfirm ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <label className={styles.check}>
              <input
                type="checkbox"
                checked={termos}
                onChange={(event) => setTermos(event.target.checked)}
              />
              Aceito os termos de uso
            </label>
          </>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? "Aguarde..." : tab === "entrar" ? "Entrar" : "Criar conta"}
        </button>
      </form>
    </div>
  );
}

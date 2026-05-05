"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./LoginForm.module.css";
import type { Tab } from "./LoginCard";

type Perfil = "ALUNO" | "PROFESSOR";

interface LoginFormProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function LoginForm({ tab, onTabChange }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [perfil, setPerfil] = useState<Perfil>("ALUNO");

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>
        {tab === "entrar" ? "Login" : "Cadastro"}
      </h1>
      <p className={styles.subtitle}>
        {tab === "entrar"
          ? "Digite os dados da sua conta"
          : "Crie sua conta no Acadus"}
      </p>

      <div className={styles.tabs}>
        <button
          type="button"
          className={tab === "entrar" ? styles.tabActive : styles.tab}
          onClick={() => onTabChange("entrar")}
        >
          Entrar
        </button>
        <button
          type="button"
          className={tab === "cadastrar" ? styles.tabActive : styles.tab}
          onClick={() => onTabChange("cadastrar")}
        >
          Cadastrar
        </button>
      </div>

      <form className={styles.form}>
        {tab === "cadastrar" && (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nome">
              Nome completo
            </label>
            <input
              id="nome"
              type="text"
              className={styles.input}
              placeholder=" "
              autoComplete="name"
            />
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            {tab === "entrar" ? "Usuário / E-mail" : "E-mail institucional"}
          </label>
          <input
            id="email"
            type="email"
            className={styles.input}
            placeholder=" "
            autoComplete="email"
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
              placeholder=" "
              autoComplete={
                tab === "entrar" ? "current-password" : "new-password"
              }
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
                  placeholder=" "
                  autoComplete="new-password"
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

            <div className={styles.field}>
              <label className={styles.label}>Perfil</label>
              <div className={styles.perfilRow}>
                <button
                  type="button"
                  className={
                    perfil === "ALUNO" ? styles.perfilActive : styles.perfilBtn
                  }
                  onClick={() => setPerfil("ALUNO")}
                >
                  Aluno
                </button>
                <button
                  type="button"
                  className={
                    perfil === "PROFESSOR"
                      ? styles.perfilActive
                      : styles.perfilBtn
                  }
                  onClick={() => setPerfil("PROFESSOR")}
                >
                  Professor
                </button>
              </div>
            </div>
          </>
        )}

        {tab === "entrar" && (
          <Link href="#" className={styles.forgot}>
            Esqueceu a senha?
          </Link>
        )}

        <button type="submit" className={styles.submit}>
          {tab === "entrar" ? "Entrar" : "Criar conta"}
        </button>
      </form>
    </div>
  );
}

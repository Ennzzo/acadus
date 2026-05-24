"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { clearCurrentUser, getCurrentUser } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { Notificacao } from "@/types/notificacao";
import styles from "./IconSidebar.module.css";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const items: NavItem[] = [
  {
    label: "Início",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Projetos",
    href: "/projetos",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Equipe",
    href: "/equipes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Tarefas",
    href: "/tarefas",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    label: "Chat",
    href: "/chat",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    ),
  },
  {
    label: "Notificações",
    href: "/notificacoes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

export default function IconSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function loadUnread() {
      const usuario = getCurrentUser();
      if (!usuario) return;

      const data = await apiFetch<Notificacao[]>(`/notificacoes?email=${encodeURIComponent(usuario.email)}`, {
        cache: "no-store",
      });
      const seen = Number(localStorage.getItem("acadus_notificacoes_vistas") ?? "0");
      setUnread(data.length > seen);
    }

    loadUnread().catch(() => {});
  }, [pathname]);

  function logout() {
    clearCurrentUser();
    toast.info("Você saiu da conta.");
    router.push("/login");
  }

  return (
    <>
    {mobileOpen && <button className={styles.mobileBackdrop} aria-label="Fechar menu" onClick={() => setMobileOpen(false)} />}
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ""}`}>
      <div className={styles.brand}>
        <span>Acadus</span>
        <button className={styles.mobileClose} type="button" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
      <nav className={styles.nav}>
        <ul className={styles.list}>
          {items.map(({ label, href, icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
            <li key={label}>
              <Link href={href} className={`${styles.item} ${active ? styles.active : ""}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.icon}>{icon}</span>
                <span className={styles.label}>{label}</span>
                {label === "Notificações" && unread && <span className={styles.dot} />}
              </Link>
            </li>
            );
          })}
        </ul>
      </nav>
      <button className={styles.logout} onClick={logout} type="button">
        <span className={styles.icon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </span>
        <span className={styles.label}>Sair</span>
      </button>
    </aside>
    <div className={styles.mobileHeader}>
      <div className={styles.mobileBrand}>
        <button onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
          <span />
          <span />
          <span />
        </button>
        <span>Acadus</span>
      </div>
      <div className={styles.mobileTop}>
        <Link href="/chat" aria-label="Chat" className={pathname === "/chat" ? styles.mobileActive : ""}>
          {items[4].icon}
        </Link>
        <Link href="/notificacoes" aria-label="Notificações" className={pathname === "/notificacoes" ? styles.mobileActive : ""}>
          {items[5].icon}
          {unread && <span className={styles.dot} />}
        </Link>
      </div>
    </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
];

export default function IconSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span>Acadus</span>
      </div>
      <nav className={styles.nav}>
        <ul className={styles.list}>
          {items.map(({ label, href, icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
            <li key={label}>
              <Link href={href} className={`${styles.item} ${active ? styles.active : ""}`}>
                <span className={styles.icon}>{icon}</span>
                <span className={styles.label}>{label}</span>
              </Link>
            </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

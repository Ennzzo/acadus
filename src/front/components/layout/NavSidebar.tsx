import styles from "./NavSidebar.module.css";
import SidebarSection from "./SidebarSection";
import SidebarItem from "./SidebarItem";

export default function NavSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>Início</h2>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn} title="Pesquisar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button className={styles.iconBtn} title="Configurações">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button className={styles.iconBtn} title="Adicionar">+</button>
        </div>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.quickList}>
          <li>
            <SidebarItem
              label="Caixa de entrada"
              href="/dashboard"
              isActive
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                  <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                </svg>
              }
            />
          </li>
          <li>
            <SidebarItem
              label="Respostas"
              href="/dashboard"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                </svg>
              }
            />
          </li>
          <li>
            <SidebarItem
              label="Comentários atribuídos"
              href="/dashboard"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              }
            />
          </li>
          <li>
            <SidebarItem
              label="Minhas tarefas"
              href="/dashboard"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              }
            />
          </li>
        </ul>

        <SidebarSection title="Favoritos" addLabel="Adicionar favorito">
        </SidebarSection>

        <SidebarSection title="Espaços" addLabel="Novo Espaço">
          <li>
            <SidebarItem
              label="Todas as tarefas — Acadus"
              href="/projetos"
              icon={
                <svg width="8" height="8" viewBox="0 0 8 8" fill="#9ca3af">
                  <circle cx="4" cy="4" r="4" />
                </svg>
              }
            />
          </li>
          <li>
            <SidebarItem
              label="Espaço da equipe"
              href="/dashboard"
              isAlert
              avatar="E"
            />
          </li>
        </SidebarSection>

        <SidebarSection title="Canais" addLabel="Adicionar canal">
          <li>
            <SidebarItem
              label="Welcome"
              href="/dashboard"
              icon={<span style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>#</span>}
            />
          </li>
          <li>
            <SidebarItem
              label="Geral — Meu Workspace"
              href="/dashboard"
              isOnline
              avatar="G"
            />
          </li>
        </SidebarSection>

        <SidebarSection title="Mensagens diretas" addLabel="Nova mensagem">
          <li>
            <SidebarItem
              label="Scartlet z — Você"
              href="/dashboard"
              isOnline
              avatar="S"
            />
          </li>
        </SidebarSection>
      </nav>
    </aside>
  );
}

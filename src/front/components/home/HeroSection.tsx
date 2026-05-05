import Link from "next/link";
import styles from "./HeroSection.module.css";

type StatusType = "Em andamento" | "Concluído" | "Pendente" | "Atrasado";

interface MockProject {
  nome: string;
  status: StatusType;
  prazo: string;
  professor: string;
}

const bullets = [
  { bold: "Organize.", description: "Submeta e acompanhe todos os seus trabalhos em um só lugar." },
  { bold: "Colabore.", description: "Professores e alunos trabalhando com contexto completo." },
  { bold: "Gerencie prazos.", description: "Nunca perca uma entrega importante." },
];

const tabs = ["Projetos", "Submissões", "Avaliações", "Prazos", "Chat", "Dashboard"];

const mockProjects: MockProject[] = [
  { nome: "TCC de Engenharia", status: "Em andamento", prazo: "20 Jul", professor: "Dr. Silva" },
  { nome: "Artigo Científico", status: "Concluído", prazo: "10 Mai", professor: "Dra. Costa" },
  { nome: "Relatório Final", status: "Pendente", prazo: "15 Jun", professor: "Prof. Lima" },
  { nome: "Projeto Integrador", status: "Em andamento", prazo: "30 Jul", professor: "Dr. Alves" },
  { nome: "Seminário de Pesquisa", status: "Atrasado", prazo: "01 Mai", professor: "Dra. Rocha" },
];

const statusClasses: Record<StatusType, string> = {
  "Em andamento": styles.statusBlue,
  "Concluído": styles.statusGreen,
  "Pendente": styles.statusYellow,
  "Atrasado": styles.statusRed,
};

export default function HeroSection() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <span className={styles.badge}>Sistema de Gestão de Trabalhos Acadêmicos</span>
        <h1 className={styles.title}>
          A plataforma para<br />
          gerenciar seus<br />
          trabalhos acadêmicos
        </h1>
        <ul className={styles.bullets}>
          {bullets.map(({ bold, description }) => (
            <li key={bold} className={styles.bulletItem}>
              <span className={styles.checkIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span><strong>{bold}</strong> {description}</span>
            </li>
          ))}
        </ul>
        <Link href="/login" className={styles.cta}>Começar agora — é gratuito</Link>
        <p className={styles.subtext}>Acesso institucional. Sem cadastro externo.</p>
        <p className={styles.tagline}>
          Gerencie seus projetos • Acompanhe entregas • Colabore com professores
        </p>
      </div>

      <div className={styles.tabRow}>
        {tabs.map((tab, i) => (
          <span key={tab} className={i === 0 ? styles.tabActive : styles.tabItem}>
            {tab}
          </span>
        ))}
      </div>

      <div className={styles.mockupWrapper}>
        <div className={styles.mockup}>
          <div className={styles.mockupBar}>
            <div className={styles.mockupDots}>
              <span className={styles.dotRed} />
              <span className={styles.dotYellow} />
              <span className={styles.dotGreen} />
            </div>
            <span className={styles.mockupTitle}>Acadus — Meus Projetos</span>
          </div>
          <div className={styles.mockupBody}>
            <aside className={styles.mockupSidebar}>
              <div className={styles.sidebarItemActive}>Dashboard</div>
              <div className={styles.sidebarItem}>Projetos</div>
              <div className={styles.sidebarItem}>Submissões</div>
              <div className={styles.sidebarItem}>Prazos</div>
              <div className={styles.sidebarItem}>Professores</div>
            </aside>
            <div className={styles.mockupMain}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Nome</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Prazo</th>
                    <th className={styles.th}>Professor</th>
                  </tr>
                </thead>
                <tbody>
                  {mockProjects.map((row) => (
                    <tr key={row.nome} className={styles.tr}>
                      <td className={styles.td}>{row.nome}</td>
                      <td className={styles.td}>
                        <span className={`${styles.status} ${statusClasses[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className={styles.td}>{row.prazo}</td>
                      <td className={styles.td}>{row.professor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import styles from "./Footer.module.css";

const columns = [
  {
    heading: "Plataforma",
    links: ["Dashboard", "Projetos", "Entregas", "Avaliações", "Chat"],
  },
  {
    heading: "Perfis",
    links: ["Aluno", "Professor"],
  },
  {
    heading: "Recursos",
    links: ["Prazos", "Relatórios", "Notificações", "Histórico"],
  },
  {
    heading: "Institucional",
    links: ["Sobre", "Contato", "Privacidade", "Termos"],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <span className={styles.logo}>Acadus</span>
          <p className={styles.desc}>
            A plataforma que centraliza a gestão de trabalhos acadêmicos para
            alunos e professores.
          </p>
        </div>
        {columns.map(({ heading, links }) => (
          <div key={heading} className={styles.column}>
            <h3 className={styles.columnHeading}>{heading}</h3>
            <ul className={styles.linkList}>
              {links.map((link) => (
                <li key={link}>
                  <Link href="/login" className={styles.link}>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={styles.bottom}>
        <span>© 2026 Acadus</span>
        <div className={styles.bottomLinks}>
          <Link href="/login" className={styles.bottomLink}>Status</Link>
          <Link href="/login" className={styles.bottomLink}>Segurança</Link>
          <Link href="/login" className={styles.bottomLink}>Privacidade</Link>
          <Link href="/login" className={styles.bottomLink}>Termos</Link>
        </div>
      </div>
    </footer>
  );
}

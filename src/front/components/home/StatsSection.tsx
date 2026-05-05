import Link from "next/link";
import styles from "./StatsSection.module.css";

const stats = [
  {
    label: "Trabalhos gerenciados",
    value: "1.200+",
    description:
      "Trabalhos submetidos e acompanhados por alunos usando a plataforma.",
  },
  {
    label: "Professores ativos",
    value: "150+",
    description:
      "Professores avaliando e dando feedback com mais eficiência.",
  },
  {
    label: "Entregas no prazo",
    value: "94%",
    description:
      "Taxa de entregas dentro do prazo entre usuários ativos do Acadus.",
  },
  {
    label: "Turmas beneficiadas",
    value: "300+",
    description:
      "Turmas e disciplinas gerenciando trabalhos com a plataforma.",
  },
];

export default function StatsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.left}>
          <h2 className={styles.title}>
            É como ter um supervisor acadêmico dedicado 24h
          </h2>
          <p className={styles.subtitle}>
            O Acadus centraliza toda a gestão acadêmica e economiza horas da
            sua semana, para que você se concentre no que importa: aprender.
          </p>
          <Link href="/login" className={styles.cta}>
            Começar agora
          </Link>
          <p className={styles.footnote}>
            *baseado em dados de uso da plataforma
          </p>
        </div>
        <div className={styles.right}>
          <div className={styles.grid}>
            {stats.map(({ label, value, description }) => (
              <div key={label} className={styles.statCard}>
                <p className={styles.statLabel}>{label}</p>
                <p className={styles.statValue}>{value}</p>
                <p className={styles.statDescription}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

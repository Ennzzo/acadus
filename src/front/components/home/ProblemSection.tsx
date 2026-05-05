import styles from "./ProblemSection.module.css";

const problems = [
  {
    label: "Prazos perdidos",
    stat: "73% dos alunos",
    description:
      "Perdem prazos de entrega por falta de acompanhamento centralizado dos projetos acadêmicos.",
  },
  {
    label: "Feedback disperso",
    stat: "85% dos professores",
    description:
      "Gastam horas organizando avaliações e feedbacks espalhados em e-mails e planilhas.",
  },
  {
    label: "Colaboração ineficiente",
    stat: "2,5h diárias",
    description:
      "São desperdiçadas buscando informações sobre trabalhos sem contexto compartilhado.",
  },
];

export default function ProblemSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          70% dos trabalhos acadêmicos
          <br />
          enfrentam problemas de gestão
        </h2>
        <p className={styles.subtitle}>
          A desorganização acadêmica está prejudicando alunos e professores.
        </p>
        <div className={styles.cards}>
          {problems.map(({ label, stat, description }) => (
            <div key={label} className={styles.card}>
              <p className={styles.cardLabel}>{label}</p>
              <p className={styles.cardStat}>{stat}</p>
              <p className={styles.cardDescription}>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

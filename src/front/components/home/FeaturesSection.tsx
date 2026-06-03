import styles from "./FeaturesSection.module.css";

const features = [
  {
    tag: "@ALUNOS",
    tagClass: styles.tagBlue,
    title: "Submeta e acompanhe trabalhos com total visibilidade sobre cada etapa.",
  },
  {
    tag: "PRAZOS",
    tagClass: styles.tagAmber,
    title: "Professores e alunos nunca perdem uma entrega importante.",
  },
  {
    tag: "PROJETOS",
    tagClass: styles.tagPink,
    title: "Gerencie todos os trabalhos acadêmicos em um só lugar.",
  },
];

export default function FeaturesSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <span className={styles.icon} aria-hidden="true" />
        <h2 className={styles.title}>
          A única plataforma que funciona
          <br />
          onde você estuda
        </h2>
        <div className={styles.cards}>
          {features.map(({ tag, tagClass, title }) => (
            <div key={tag} className={styles.card}>
              <span className={`${styles.tag} ${tagClass}`}>{tag}</span>
              <p className={styles.cardTitle}>{title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

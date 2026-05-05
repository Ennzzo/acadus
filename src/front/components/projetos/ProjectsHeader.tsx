import styles from "./ProjectsHeader.module.css";

interface ProjectsHeaderProps {
  total: number;
}

const stats = [
  { label: "Em andamento", value: 2, color: styles.dotBlue },
  { label: "Concluídos", value: 2, color: styles.dotGreen },
  { label: "Pendentes", value: 1, color: styles.dotYellow },
  { label: "Atrasados", value: 1, color: styles.dotRed },
];

export default function ProjectsHeader({ total }: ProjectsHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.title}>Meus Projetos</h1>
          <p className={styles.subtitle}>{total} projetos no total</p>
        </div>
        <button className={styles.newBtn}>+ Novo Projeto</button>
      </div>
      <div className={styles.stats}>
        {stats.map(({ label, value, color }) => (
          <div key={label} className={styles.stat}>
            <span className={`${styles.dot} ${color}`} />
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import styles from "./ProjectOverviewBanner.module.css";

interface ProjectOverviewBannerProps {
  onDismiss?: () => void;
}

export default function ProjectOverviewBanner({ onDismiss }: ProjectOverviewBannerProps) {
  return (
    <div className={styles.banner}>
      <div className={styles.icon}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      </div>
      <p className={styles.text}>
        Aproveite ao máximo a sua visão geral! Adicione, reordene e redimensione cartões para personalizar esta página{" "}
        <a href="#" className={styles.link}>Começar</a>
      </p>
      <button className={styles.close} title="Fechar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

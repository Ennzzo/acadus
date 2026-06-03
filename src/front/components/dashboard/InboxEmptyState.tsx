import styles from "./InboxEmptyState.module.css";

interface InboxEmptyStateProps {
  title: string;
  subtitle: string;
}

export default function InboxEmptyState({
  title,
  subtitle,
}: InboxEmptyStateProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.iconRing}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span className={styles.plus}>+</span>
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
}

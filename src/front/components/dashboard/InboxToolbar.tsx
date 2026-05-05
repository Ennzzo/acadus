import styles from "./InboxToolbar.module.css";

export default function InboxToolbar() {
  return (
    <div className={styles.toolbar}>
      <button className={styles.filterBtn}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filtro
      </button>
    </div>
  );
}

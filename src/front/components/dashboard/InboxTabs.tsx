import styles from "./InboxTabs.module.css";

const tabs = [
  { label: "Principal", icon: null },
  { label: "Outro", icon: null },
  { label: "Mais tarde", icon: null },
  { label: "Removidas", icon: null },
];

export default function InboxTabs() {
  return (
    <div className={styles.tabs}>
      {tabs.map(({ label, icon }, i) => (
        <span key={label} className={i === 0 ? styles.active : styles.tab}>
          {icon && <span className={styles.tabIcon}>{icon}</span>}
          {label}
        </span>
      ))}
    </div>
  );
}

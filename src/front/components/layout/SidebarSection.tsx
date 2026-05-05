import styles from "./SidebarSection.module.css";

interface SidebarSectionProps {
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  children: React.ReactNode;
}

export default function SidebarSection({
  title,
  addLabel,
  children,
}: SidebarSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {addLabel && (
          <button className={styles.addBtn} type="button">
            +
          </button>
        )}
      </div>
      <ul className={styles.list}>{children}</ul>
      {addLabel && (
        <button className={styles.addItem} type="button">
          + {addLabel}
        </button>
      )}
    </section>
  );
}

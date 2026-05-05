import Link from "next/link";
import styles from "./SidebarItem.module.css";

interface SidebarItemProps {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number | null;
  isActive?: boolean;
  isOnline?: boolean;
  isAlert?: boolean;
  avatar?: string;
}

export default function SidebarItem({
  label,
  href,
  icon,
  badge,
  isActive,
  isOnline,
  isAlert,
  avatar,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={`${styles.item} ${isActive ? styles.active : ""}`}
    >
      {avatar ? (
        <span
          className={`${styles.avatar} ${isOnline ? styles.avatarOnline : ""} ${isAlert ? styles.avatarAlert : ""}`}
        >
          {avatar}
        </span>
      ) : (
        <span className={styles.icon}>{icon}</span>
      )}
      <span className={styles.label}>{label}</span>
      {badge != null && badge > 0 && (
        <span className={styles.badge}>{badge}</span>
      )}
    </Link>
  );
}

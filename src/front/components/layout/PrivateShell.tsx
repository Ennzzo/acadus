import IconSidebar from "@/components/layout/IconSidebar";
import styles from "./PrivateShell.module.css";

interface PrivateShellProps {
  children: React.ReactNode;
}

export default function PrivateShell({ children }: PrivateShellProps) {
  return (
    <div className={styles.shell}>
      <IconSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}

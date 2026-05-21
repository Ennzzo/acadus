import Link from "next/link";
import styles from "./ProjectPageHeader.module.css";

interface ProjectPageHeaderProps {
  espaco: string;
  nome: string;
}

export default function ProjectPageHeader({ espaco, nome }: ProjectPageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <nav className={styles.breadcrumb}>
          <Link href="/projetos" className={styles.breadcrumbLink}>{espaco}</Link>
          <span className={styles.separator}>/</span>
          <span className={styles.breadcrumbCurrent}>{nome}</span>
        </nav>
      </div>
    </header>
  );
}

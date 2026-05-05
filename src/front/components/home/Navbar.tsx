import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <span className={styles.logo}>Acadus</span>
        <div className={styles.links}>
          <Link href="/login" className={styles.linkOutline}>
            Entrar
          </Link>
          <Link href="/login" className={styles.linkFilled}>
            Cadastrar
          </Link>
        </div>
      </nav>
    </header>
  );
}

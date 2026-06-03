import Link from "next/link";
import styles from "./CtaSection.module.css";

export default function CtaSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.gradient}>
          <span className={styles.icon} aria-hidden="true" />
          <h2 className={styles.title}>
            Organize seus trabalhos
            <br />
            acadêmicos de uma vez.
          </h2>
          <Link href="/login" className={styles.cta}>
            Acessar o Acadus
          </Link>
        </div>
      </div>
    </section>
  );
}

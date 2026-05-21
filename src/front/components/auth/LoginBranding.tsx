import styles from "./LoginBranding.module.css";

export default function LoginBranding() {
  return (
    <div className={styles.panel}>
      <div className={styles.text}>
        <h2 className={styles.title}>
          Bem-vindo ao
          <br />
          Acadus
        </h2>
        <p className={styles.subtitle}>Acesse sua conta para continuar</p>
      </div>

      <div className={styles.illustration}>
        <div className={styles.docCard}>
          <div className={styles.docLine} />
          <div className={styles.docLine} />
          <div className={styles.docLineShort} />
          <div className={styles.docLine} />
          <div className={styles.docLineShort} />
        </div>
        <div className={styles.lupa}>
          <div className={styles.lupaCircle} />
          <div className={styles.lupaHandle} />
        </div>
        <div className={styles.avatar}>
          <div className={styles.avatarHead} />
          <div className={styles.avatarBody} />
        </div>
        <div className={styles.phone}>
          <span />
        </div>
      </div>
    </div>
  );
}

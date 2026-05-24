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
    </div>
  );
}

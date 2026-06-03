"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import LoginBranding from "@/components/auth/LoginBranding";
import styles from "./LoginCard.module.css";

export type Tab = "entrar" | "cadastrar";

export default function LoginCard() {
  const [tab, setTab] = useState<Tab>("entrar");

  return (
    <div className={styles.card}>
      <div className={styles.formPanel}>
        <LoginForm tab={tab} onTabChange={setTab} />
      </div>
      <div className={styles.brandingPanel}>
        <LoginBranding />
      </div>
    </div>
  );
}

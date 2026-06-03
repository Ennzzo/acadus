"use client";

import { useEffect, useState } from "react";
import { ToastMessage } from "@/lib/toast";
import styles from "./ToastHost.module.css";

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    function onToast(event: Event) {
      const toast = (event as CustomEvent<ToastMessage>).detail;
      setToasts((items) => [...items, toast]);
      window.setTimeout(() => {
        setToasts((items) => items.filter((item) => item.id !== toast.id));
      }, 3600);
    }

    window.addEventListener("acadus-toast", onToast);
    return () => window.removeEventListener("acadus-toast", onToast);
  }, []);

  if (toasts.length === 0) return null;

  function close(id: number) {
    setToasts((items) => items.filter((item) => item.id !== id));
  }

  return (
    <div className={styles.wrap}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <span>{toast.message}</span>
          <button type="button" onClick={() => close(toast.id)} aria-label="Fechar aviso">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

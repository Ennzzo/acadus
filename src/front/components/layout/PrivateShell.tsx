"use client";

import { useState } from "react";
import IconSidebar from "@/components/layout/IconSidebar";
import NavSidebar from "@/components/layout/NavSidebar";
import styles from "./PrivateShell.module.css";

interface PrivateShellProps {
  children: React.ReactNode;
}

export default function PrivateShell({ children }: PrivateShellProps) {
  const [isNavOpen, setIsNavOpen] = useState(true);

  return (
    <div className={styles.shell}>
      <IconSidebar onToggleNav={() => setIsNavOpen((prev) => !prev)} />
      <div
        className={`${styles.navWrapper} ${isNavOpen ? styles.navOpen : styles.navClosed}`}
      >
        <NavSidebar />
      </div>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

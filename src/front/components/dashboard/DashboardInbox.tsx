import AppHeader from "@/components/layout/AppHeader";
import InboxEmptyState from "./InboxEmptyState";
import styles from "./DashboardInbox.module.css";

export default function DashboardInbox() {
  return (
    <div className={styles.wrapper}>
      <AppHeader title="Início" />
      <InboxEmptyState
        title="Tudo certo por aqui"
        subtitle="Use o menu lateral para acessar seus projetos e tarefas."
      />
    </div>
  );
}

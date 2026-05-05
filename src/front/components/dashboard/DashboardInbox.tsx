import AppHeader from "@/components/layout/AppHeader";
import InboxTabs from "./InboxTabs";
import InboxToolbar from "./InboxToolbar";
import InboxEmptyState from "./InboxEmptyState";
import styles from "./DashboardInbox.module.css";

export default function DashboardInbox() {
  return (
    <div className={styles.wrapper}>
      <AppHeader title="Início" />
      <div className={styles.tabBar}>
        <InboxTabs />
      </div>
      <InboxToolbar />
      <InboxEmptyState
        title="Quer colaborar?"
        subtitle="A colaboração está a um convite de distância."
        actionLabel="Convidar pessoas"
      />
    </div>
  );
}

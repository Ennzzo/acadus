import styles from "./ProjectWidgets.module.css";

interface TasksData {
  label: string;
  count: number;
  color: string;
}

interface ProjectWidgetsProps {
  membros: string[];
  totalTarefas: number;
  tarefasConcluidas: number;
}

export default function ProjectWidgets({ membros, totalTarefas, tarefasConcluidas }: ProjectWidgetsProps) {
  const tasksData: TasksData[] = [
    { label: "Não atribuído", count: totalTarefas - tarefasConcluidas, color: "#9ca3af" },
    { label: membros[0] ?? "Membro 1", count: tarefasConcluidas, color: "#7c3aed" },
  ];

  return (
    <div className={styles.grid}>
      {/* Resources widget */}
      <div className={styles.widget}>
        <div className={styles.widgetHeader}>
          <h3 className={styles.widgetTitle}>Resources</h3>
          <div className={styles.widgetActions}>
            <button className={styles.widgetBtn} title="Expandir">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
            <button className={styles.widgetBtn} title="Mais opções">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
              </svg>
            </button>
          </div>
        </div>
        <div className={styles.uploadArea}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.uploadIcon}>
            <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
          <p className={styles.uploadText}>
            Solte os arquivos aqui ou{" "}
            <a href="#" className={styles.uploadLink}>Anexar</a>
          </p>
        </div>
      </div>

      {/* Tasks by Assignee widget */}
      <div className={styles.widget}>
        <div className={styles.widgetHeader}>
          <h3 className={styles.widgetTitle}>Tasks by Assignee</h3>
          <div className={styles.widgetActions}>
            <button className={styles.widgetBtn} title="Expandir">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
            <button className={styles.widgetBtn}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
              </svg>
            </button>
          </div>
        </div>
        <div className={styles.chartArea}>
          <div className={styles.donut}>
            <svg viewBox="0 0 100 100" className={styles.donutSvg}>
              <circle cx="50" cy="50" r="35" fill="none" stroke="#e5e7eb" strokeWidth="16" />
              <circle
                cx="50" cy="50" r="35" fill="none"
                stroke="#7c3aed" strokeWidth="16"
                strokeDasharray={`${(tarefasConcluidas / totalTarefas) * 220} 220`}
                strokeDashoffset="55"
                strokeLinecap="round"
              />
              <circle
                cx="50" cy="50" r="35" fill="none"
                stroke="#9ca3af" strokeWidth="16"
                strokeDasharray={`${((totalTarefas - tarefasConcluidas) / totalTarefas) * 220} 220`}
                strokeDashoffset={`${55 - (tarefasConcluidas / totalTarefas) * 220}`}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className={styles.legend}>
            {tasksData.map((item) => (
              <div key={item.label} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: item.color }} />
                <span className={styles.legendLabel}>{item.label}</span>
                <span className={styles.legendCount}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

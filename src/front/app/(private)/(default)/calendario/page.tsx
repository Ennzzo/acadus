"use client";

import CalendarView from "@/components/calendario/CalendarView";
import ProjectWorkspace from "@/components/projetos/ProjectWorkspace";

export default function CalendarioPage() {
  return (
    <ProjectWorkspace title="Calendário">
      {() => <CalendarView />}
    </ProjectWorkspace>
  );
}

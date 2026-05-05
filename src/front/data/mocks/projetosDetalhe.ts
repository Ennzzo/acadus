import { ProjetoDetalhe } from "@/types/projeto";

export const projetosDetalheMock: ProjetoDetalhe[] = [
  {
    id: "1",
    nome: "TCC de Engenharia de Software",
    descricao: "Desenvolvimento de uma plataforma de gestão acadêmica usando Next.js e Spring Boot.",
    status: "EM_ANDAMENTO",
    dataEntrega: "2026-07-20",
    professor: "Dr. Carlos Silva",
    disciplina: "Trabalho de Conclusão de Curso",
    progresso: 45,
    espaco: "Equipe de Gerenciamento",
    totalTarefas: 14,
    tarefasConcluidas: 6,
    membros: ["EW", "SZ", "MC"],
    listas: [
      {
        id: "l1",
        nome: "Projeto 1",
        cor: "#7c3aed",
        progresso: 0,
        totalTarefas: 7,
        tarefasConcluidas: 0,
        inicio: null,
        termino: null,
        prioridade: null,
        proprietario: null,
      },
      {
        id: "l2",
        nome: "Designs",
        cor: "#0ea5e9",
        progresso: 0,
        totalTarefas: 7,
        tarefasConcluidas: 0,
        inicio: null,
        termino: null,
        prioridade: null,
        proprietario: null,
      },
    ],
  },
  {
    id: "2",
    nome: "Artigo Científico — IA na Educação",
    descricao: "Pesquisa sobre o impacto da inteligência artificial em ambientes de aprendizagem.",
    status: "CONCLUIDO",
    dataEntrega: "2026-05-10",
    professor: "Dra. Ana Costa",
    disciplina: "Métodos de Pesquisa Científica",
    progresso: 100,
    espaco: "Equipe de Gerenciamento",
    totalTarefas: 8,
    tarefasConcluidas: 8,
    membros: ["EW", "SZ"],
    listas: [
      {
        id: "l3",
        nome: "Pesquisa",
        cor: "#10b981",
        progresso: 100,
        totalTarefas: 4,
        tarefasConcluidas: 4,
        inicio: "2026-03-01",
        termino: "2026-05-10",
        prioridade: "ALTA",
        proprietario: "EW",
      },
    ],
  },
];

export function getProjetoDetalhe(id: string): ProjetoDetalhe | undefined {
  return projetosDetalheMock.find((p) => p.id === id);
}

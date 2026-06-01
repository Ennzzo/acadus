import { Evento } from "@/types/evento";

export const eventosMock: Evento[] = [
  {
    id: 1,
    nome: "Entrega do relatório parcial",
    descricao: "Enviar relatório parcial do projeto para avaliação do orientador.",
    data: "2025-06-10",
    projetoId: 1,
    membros: [
      { id: 1, nome: "João Silva" },
      { id: 2, nome: "Maria Oliveira" },
    ],
  },
  {
    id: 2,
    nome: "Reunião de alinhamento",
    descricao: "Reunião semanal para alinhar tarefas e progresso do projeto.",
    data: "2025-06-12",
    projetoId: 1,
    membros: [
      { id: 1, nome: "João Silva" },
      { id: 3, nome: "Carlos Santos" },
      { id: 4, nome: "Ana Costa" },
    ],
  },
  {
    id: 3,
    nome: "Apresentação final do TCC",
    descricao: "Apresentação do projeto final para a banca avaliadora.",
    data: "2025-06-20",
    projetoId: 2,
    membros: [
      { id: 2, nome: "Maria Oliveira" },
    ],
  },
  {
    id: 4,
    nome: "Sprint Review",
    descricao: "Revisão do sprint atual e demonstração das entregas.",
    data: "2025-06-15",
    projetoId: 1,
    membros: [
      { id: 1, nome: "João Silva" },
      { id: 2, nome: "Maria Oliveira" },
      { id: 3, nome: "Carlos Santos" },
    ],
  },
  {
    id: 5,
    nome: "Deadline documentação técnica",
    descricao: "Prazo final para entrega da documentação técnica do sistema.",
    data: "2025-06-25",
    projetoId: 3,
    membros: [
      { id: 4, nome: "Ana Costa" },
    ],
  },
  {
    id: 6,
    nome: "Workshop de integração",
    descricao: null,
    data: "2025-06-18",
    projetoId: null,
    membros: [],
  },
  {
    id: 7,
    nome: "Revisão de código",
    descricao: "Code review completo do módulo de autenticação.",
    data: "2025-06-12",
    projetoId: 1,
    membros: [
      { id: 3, nome: "Carlos Santos" },
    ],
  },
  {
    id: 8,
    nome: "Entrega final do projeto",
    descricao: "Entrega de todos os artefatos e código-fonte do projeto.",
    data: "2025-06-30",
    projetoId: 2,
    membros: [
      { id: 1, nome: "João Silva" },
      { id: 2, nome: "Maria Oliveira" },
      { id: 3, nome: "Carlos Santos" },
      { id: 4, nome: "Ana Costa" },
    ],
  },
];

export const membrosMock = [
  { id: 1, nome: "João Silva" },
  { id: 2, nome: "Maria Oliveira" },
  { id: 3, nome: "Carlos Santos" },
  { id: 4, nome: "Ana Costa" },
  { id: 5, nome: "Pedro Almeida" },
];

export function getEventosPorMes(ano: number, mes: number): Evento[] {
  return eventosMock.filter((e) => {
    const d = new Date(e.data + "T00:00:00");
    return d.getFullYear() === ano && d.getMonth() === mes;
  });
}

export function getEventoById(id: number): Evento | undefined {
  return eventosMock.find((e) => e.id === id);
}

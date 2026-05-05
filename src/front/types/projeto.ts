export type StatusProjeto = "EM_ANDAMENTO" | "CONCLUIDO" | "PENDENTE" | "ATRASADO";

export interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  status: StatusProjeto;
  dataEntrega: string;
  professor: string;
  disciplina: string;
  progresso: number; // 0–100
}

export type PrioridadeLista = "ALTA" | "MEDIA" | "BAIXA" | null;

export interface ProjetoLista {
  id: string;
  nome: string;
  cor: string; // hex
  progresso: number; // tasks done / total
  totalTarefas: number;
  tarefasConcluidas: number;
  inicio: string | null;
  termino: string | null;
  prioridade: PrioridadeLista;
  proprietario: string | null;
}

export interface ProjetoDetalhe extends Projeto {
  espaco: string;
  listas: ProjetoLista[];
  totalTarefas: number;
  tarefasConcluidas: number;
  membros: string[];
}

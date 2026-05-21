export type StatusTarefa =
  | "PENDENTE"
  | "EM_ANDAMENTO"
  | "EM_VALIDACAO"
  | "APROVADA"
  | "AJUSTES";

export interface Tarefa {
  id: number;
  projetoId: number;
  nome: string;
  descricao?: string | null;
  responsavel?: string | null;
  prazo?: string | null;
  progresso: number;
  comentario?: string | null;
  checklist?: string | null;
  anexo?: string | null;
  status: StatusTarefa;
}

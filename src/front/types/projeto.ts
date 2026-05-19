export type StatusProjeto = "ATIVO" | "CONCLUIDO";

export interface Projeto {
  id: number;
  nomeProjeto: string;
  descricao?: string | null;
  dataCriacao: string;
  status: StatusProjeto;
}

export type StatusProjeto = "ATIVO" | "CONCLUIDO";

export interface Projeto {
  id: number;
  nomeProjeto: string;
  descricao?: string | null;
  dataCriacao: string;
  nomeEquipe?: string | null;
  liderEmail?: string | null;
  capaUrl?: string | null;
  status: StatusProjeto;
}

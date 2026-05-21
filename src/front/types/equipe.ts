export type PapelMembro = "LIDER" | "MEMBRO" | "OBSERVADOR";
export type StatusConvite = "PENDENTE" | "ACEITO" | "RECUSADO";

export interface MembroEquipe {
  id: number;
  projetoId: number;
  email: string;
  papel: PapelMembro;
  mensagem?: string | null;
  status: StatusConvite;
  dataConvite: string;
}

export interface Equipe {
  projetoId: number;
  nomeProjeto: string;
  nomeEquipe?: string | null;
  membros: MembroEquipe[];
}

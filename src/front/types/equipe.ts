export type StatusEquipe = "ATIVA" | "EXCLUIDA";
export type PapelEquipe = "LIDER" | "MEMBRO" | "OBSERVADOR";
export type StatusConvite = "PENDENTE" | "ACEITO" | "RECUSADO";

export interface Equipe {
  id: number;
  nome: string;
  projetoId: number;
  dataCriacao: string;
  status: StatusEquipe;
}

export interface MembroEquipe {
  id: number;
  usuarioId: number;
  nomeUsuario: string;
  papel: PapelEquipe;
}

export interface ConviteEquipe {
  id: number;
  emailConvidado: string;
  status: StatusConvite;
  dataEnvio: string;
}

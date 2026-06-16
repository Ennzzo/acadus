export type PapelMembro = "LIDER" | "MEMBRO";
export type PapelEquipe = PapelMembro;
export type StatusConvite = "PENDENTE" | "ACEITO" | "RECUSADO" | "CANCELADO";
export type StatusEquipe = "ATIVA" | "EXCLUIDA";

export interface MembroEquipe {
  id: number;
  projetoId?: number;
  usuarioId?: number;
  email: string;
  nome?: string | null;
  nomeUsuario?: string | null;
  sobrenome?: string | null;
  fotoUrl?: string | null;
  papel: PapelMembro;
  mensagem?: string | null;
  convidadoPor?: string | null;
  transferenciaPendente?: boolean;
  statusTransferencia?: StatusConvite | null;
  bloqueado?: boolean;
  motivoBloqueio?: string | null;
  status: StatusConvite;
  dataConvite: string;
  dataEntrada?: string | null;
  dataSaida?: string | null;
  removido?: boolean;
  ocultoLista?: boolean;
}

export interface Equipe {
  id: number;
  projetoId: number;
  nome?: string;
  nomeProjeto: string;
  nomeEquipe?: string | null;
  liderEmail?: string | null;
  status?: StatusEquipe;
  membros: MembroEquipe[];
}

export interface ConviteEquipe {
  id: number;
  equipeId?: number;
  emailConvidado: string;
  papel?: PapelMembro;
  status: StatusConvite;
  dataEnvio: string;
}

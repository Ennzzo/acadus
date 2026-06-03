export type PapelMembro = "LIDER" | "MEMBRO";
export type StatusConvite = "PENDENTE" | "ACEITO" | "RECUSADO" | "CANCELADO";

export interface MembroEquipe {
  id: number;
  projetoId: number;
  email: string;
  nome?: string | null;
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
  projetoId: number;
  nomeProjeto: string;
  nomeEquipe?: string | null;
  liderEmail?: string | null;
  membros: MembroEquipe[];
}

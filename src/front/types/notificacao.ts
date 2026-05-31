export type TipoNotificacao =
  | "CONVITE"
  | "CONVITE_RECUSADO"
  | "LIDERANCA"
  | "TAREFA"
  | "REMOCAO_EQUIPE"
  | "SAIDA_EQUIPE"
  | "MENSAGEM_PRIVADA";
export type StatusNotificacao = "PENDENTE" | "ACEITO" | "RECUSADO" | "CANCELADO";

export interface Notificacao {
  tipo: TipoNotificacao;
  referenciaId?: number | null;
  projetoId?: number | null;
  projetoNome?: string | null;
  equipeNome?: string | null;
  remetenteEmail?: string | null;
  remetenteNome?: string | null;
  dataHora: string;
  mensagem?: string | null;
  status?: StatusNotificacao | null;
  titulo: string;
  texto: string;
}

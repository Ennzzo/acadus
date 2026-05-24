export type TipoNotificacao = "CONVITE" | "LIDERANCA" | "TAREFA";

export interface Notificacao {
  tipo: TipoNotificacao;
  referenciaId: number;
  projetoId: number;
  titulo: string;
  texto: string;
}

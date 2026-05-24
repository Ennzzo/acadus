export interface ChatMensagem {
  id: number;
  projetoId: number;
  autorEmail: string;
  autorNome?: string | null;
  tipoChat: "EQUIPE" | "PROFESSOR";
  conteudo: string;
  anexo?: string | null;
  editada?: boolean;
  conteudoAnterior?: string | null;
  excluida?: boolean;
  dataHora: string;
}

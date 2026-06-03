export interface ChatMensagem {
  id: number;
  projetoId?: number | null;
  autorEmail: string;
  autorNome?: string | null;
  tipoChat: string;
  conteudo: string;
  anexo?: string | null;
  editada?: boolean;
  conteudoAnterior?: string | null;
  excluida?: boolean;
  dataHora: string;
}

export interface ChatContato {
  email: string;
  nome: string;
  sobrenome: string;
  fotoUrl?: string | null;
  ultimaMensagem?: string | null;
  resumo?: string | null;
  naoVisualizada?: boolean;
}

export interface ChatProjeto {
  id: number;
  nomeProjeto: string;
  liderEmail?: string | null;
  statusMembro: "ACEITO" | "SAIU";
  dataSaida?: string | null;
  ultimaMensagem?: string | null;
  resumo?: string | null;
  naoVisualizada?: boolean;
  visivelDesde?: string | null;
}

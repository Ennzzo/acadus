export interface Evento {
  id: number;
  nome: string;
  descricao?: string | null;
  data: string; // ISO date string (YYYY-MM-DD)
  projetoId?: number | null;
  equipeId?: number | null;
  responsavelId?: number | null;
  membros: EventoMembro[];
}

export interface EventoMembro {
  id: number;
  nome?: string | null;
  sobrenome?: string | null;
  email?: string | null;
}

export interface EventoFormData {
  nome: string;
  data: string;
  descricao?: string;
  membrosIds: number[];
}

export interface Evento {
  id: number;
  nome: string;
  descricao?: string | null;
  data: string; // ISO date string (YYYY-MM-DD)
  projetoId?: number | null;
  membros: EventoMembro[];
}

export interface EventoMembro {
  id: number;
  nome: string;
}

export interface EventoFormData {
  nome: string;
  data: string;
  descricao?: string;
  membrosIds: number[];
}

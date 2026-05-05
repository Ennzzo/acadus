export type PerfilUsuario = "ALUNO" | "PROFESSOR";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
}

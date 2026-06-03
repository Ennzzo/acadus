"use client";

import { Usuario } from "@/types/usuario";

const USER_KEY = "acadus_usuario";
const PROJECT_KEY = "acadus_projeto_id";

export function getCurrentUser(): Usuario | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Usuario;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setCurrentUser(usuario: Usuario) {
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  localStorage.removeItem(PROJECT_KEY);
}

export function updateCurrentUser(usuario: Usuario) {
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  window.dispatchEvent(new Event("acadus-user-updated"));
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PROJECT_KEY);
}

export function clearSelectedProjectId() {
  localStorage.removeItem(PROJECT_KEY);
}

export function getSelectedProjectId(): number | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(PROJECT_KEY);
  if (!raw) return null;

  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function setSelectedProjectId(id: number) {
  localStorage.setItem(PROJECT_KEY, String(id));
}

export function withUser(path: string) {
  const email = getCurrentUser()?.email ?? "";
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}email=${encodeURIComponent(email)}`;
}

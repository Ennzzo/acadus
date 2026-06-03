const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function getErrorMessage(text: string, fallback: string) {
  if (!text) return fallback;

  try {
    const data = JSON.parse(text) as { message?: string };
    return data.message || fallback;
  } catch {
    return text;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...init.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(getErrorMessage(errorText, `Erro ${response.status}`));
  }

  const text = await response.text();

  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

export async function apiFetchText(path: string, init: RequestInit = {}): Promise<string> {
  const headers = {
    "Content-Type": "application/json",
    ...init.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Erro ${response.status}`);
  }

  return response.text();
}

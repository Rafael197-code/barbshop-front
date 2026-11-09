export type Tipo = "cliente" | "barbeiro";

const TOKEN_KEY = "barbshop:token";

type TokenPayload = { nome?: string; email?: string; tipo?: Tipo; exp?: number };

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
  }
}

function readPayload(): TokenPayload | null {
  const token = getToken();
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    const base64 = part
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(part.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as TokenPayload;
  } catch {
    return null;
  }
}

export function getUserNome(): string | null {
  return readPayload()?.nome ?? null;
}

export function getUserTipo(): Tipo | null {
  return readPayload()?.tipo ?? null;
}

export function isTokenExpired(): boolean {
  const exp = readPayload()?.exp;
  if (!exp) return false;
  return exp * 1000 <= Date.now();
}

export function sessaoValida(): boolean {
  return Boolean(getToken()) && !isTokenExpired();
}

export function homeDoUsuario(): "/barbeiro" | "/agendar" {
  return getUserTipo() === "barbeiro" ? "/barbeiro" : "/agendar";
}

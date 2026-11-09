import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Barbeiro = {
  id: number;
  nome: string;
};

export type Agendamento = {
  id: number;
  data: string;
  horario: string;
  cliente: string;
  barbeiro: string;
};

type AgendamentoApi = {
  id: number;
  data: string;
  horario: string;
  cliente: string;
  barbeiro: string;
};

export type DadosBarbeiro = {
  senha: string;
  nome: string;
  dataNascimento: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers();
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError("O servidor demorou para responder. Tente novamente.", 0);
    }
    throw new ApiError(
      "Não foi possível conectar ao servidor. Confira se a API está rodando.",
      0,
    );
  }

  const data: unknown = await res.json().catch(() => null);
  const body = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;

  if (!res.ok) {
    const message =
      (typeof body.mensagem === "string" && body.mensagem) ||
      "Algo deu errado. Tente novamente.";
    throw new ApiError(message, res.status);
  }

  return data as T;
}

function fromApi(row: AgendamentoApi): Agendamento {
  return {
    id: row.id,
    data: String(row.data).slice(0, 10),
    horario: String(row.horario).slice(0, 5),
    cliente: row.cliente,
    barbeiro: row.barbeiro,
  };
}


export async function register(input: { nome: string; email: string; senha: string }) {
  await request<{ mensagem: string }>("/register", { method: "POST", body: input });
}

export async function login(input: { email: string; senha: string }): Promise<string> {
  const res = await request<{ token: string }>("/login", { method: "POST", body: input });
  return res.token;
}


function corpoBarbeiro(dados: DadosBarbeiro) {
  return { senha: dados.senha, nome: dados.nome, data_nascimento: dados.dataNascimento };
}

export async function registerBarbeiro(dados: DadosBarbeiro) {
  await request<{ mensagem: string }>("/barbeiros/register", {
    method: "POST",
    body: corpoBarbeiro(dados),
  });
}

export async function loginBarbeiro(dados: DadosBarbeiro): Promise<string> {
  const res = await request<{ token: string }>("/barbeiros/login", {
    method: "POST",
    body: corpoBarbeiro(dados),
  });
  return res.token;
}


export async function listBarbeiros(): Promise<Barbeiro[]> {
  return request<Barbeiro[]>("/barbeiros", { auth: true });
}

export async function listAgendamentos(): Promise<Agendamento[]> {
  const rows = await request<AgendamentoApi[]>("/agendamentos", { auth: true });
  return rows.map(fromApi);
}

export async function listOcupados(barbeiroId: number, data: string): Promise<string[]> {
  const query = `barbeiro_id=${barbeiroId}&data=${encodeURIComponent(data)}`;
  return request<string[]>(`/agendamentos/ocupados?${query}`, { auth: true });
}

export async function createAgendamento(input: {
  barbeiroId: number;
  data: string;
  horario: string;
}): Promise<Agendamento> {
  const res = await request<{ agendamento: AgendamentoApi }>("/agendamentos", {
    method: "POST",
    auth: true,
    body: { barbeiro_id: input.barbeiroId, data: input.data, horario: input.horario },
  });
  return fromApi(res.agendamento);
}

export async function deleteAgendamento(id: number): Promise<void> {
  await request(`/agendamentos/${id}`, { method: "DELETE", auth: true });
}

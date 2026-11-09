"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppointmentList from "@/components/AppointmentList";
import Icon from "@/components/Icon";
import Navbar from "@/components/Navbar";
import Notice from "@/components/Notice";
import { ApiError, deleteAgendamento, listAgendamentos, type Agendamento } from "@/lib/api";
import { clearToken, getUserTipo, sessaoValida } from "@/lib/auth";
import { agoraHHMM, hojeISO } from "@/lib/datas";

type Filtro = "hoje" | "proximos";

export default function BarbeiroPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Agendamento[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("hoje");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sessaoExpirada = useCallback(() => {
    clearToken();
    router.replace("/login");
  }, [router]);

  const carregar = useCallback(async () => {
    try {
      setTodos(await listAgendamentos());
      setError(null);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        sessaoExpirada();
        return;
      }
      setError(e instanceof Error ? e.message : "Não foi possível carregar a agenda.");
    } finally {
      setLoading(false);
    }
  }, [sessaoExpirada]);

  useEffect(() => {
    if (!sessaoValida()) {
      sessaoExpirada();
      return;
    }
    if (getUserTipo() !== "barbeiro") {
      router.replace("/agendar");
      return;
    }
    carregar();
  }, [router, sessaoExpirada, carregar]);

  async function handleDelete(id: number) {
    setError(null);
    setSuccess(null);
    try {
      await deleteAgendamento(id);
      setTodos((atual) => atual.filter((a) => a.id !== id));
      setSuccess("Horário excluído.");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        sessaoExpirada();
        return;
      }
      setError(e instanceof Error ? e.message : "Não foi possível excluir.");
    }
  }

  const hoje = hojeISO();
  const deHoje = todos.filter((a) => a.data === hoje);
  const proximos = todos.filter((a) => a.data > hoje);
  const lista = filtro === "hoje" ? deHoje : proximos;

  const agora = agoraHHMM();
  const seguinte = deHoje
    .filter((a) => a.horario >= agora)
    .sort((a, b) => a.horario.localeCompare(b.horario))[0];

  const abas: { valor: Filtro; rotulo: string; total: number }[] = [
    { valor: "hoje", rotulo: "Hoje", total: deHoje.length },
    { valor: "proximos", rotulo: "Próximos dias", total: proximos.length },
  ];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <header>
          <h1 className="font-display text-4xl font-semibold leading-none text-navy sm:text-5xl">
            Meus clientes
          </h1>
          <p className="mt-3 max-w-xl text-muted">
            Os horários dos clientes que agendaram com você.
          </p>
        </header>

        {loading ? (
          <p className="mt-10 text-muted">Carregando agenda...</p>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="card flex items-center gap-4 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-tint text-navy">
                  <Icon name="user" className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm text-muted">Clientes hoje</p>
                  <p className="font-display text-3xl font-semibold leading-none text-navy">
                    {deHoje.length}
                  </p>
                </div>
              </div>

              <div className="card flex items-center gap-4 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-tint text-navy">
                  <Icon name="clock" className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-muted">Próximo cliente</p>
                  {seguinte ? (
                    <p className="mt-0.5 truncate font-semibold text-ink">
                      <span className="mr-2 font-display text-2xl font-semibold tabular-nums text-navy">
                        {seguinte.horario}
                      </span>
                      {seguinte.cliente}
                    </p>
                  ) : (
                    <p className="mt-0.5 font-semibold text-ink">
                      {deHoje.length === 0 ? "Nenhum cliente hoje" : "Todos já foram atendidos"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div
              role="tablist"
              aria-label="Período"
              className="mt-8 inline-flex gap-1 rounded-md border border-line bg-white p-1"
            >
              {abas.map((aba) => (
                <button
                  key={aba.valor}
                  type="button"
                  role="tab"
                  aria-selected={filtro === aba.valor}
                  onClick={() => setFiltro(aba.valor)}
                  className={`h-10 rounded-sm px-4 text-sm font-semibold transition-colors ${
                    filtro === aba.valor ? "bg-navy text-white" : "text-navy hover:bg-tint"
                  }`}
                >
                  {aba.rotulo} ({aba.total})
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-5">
              {error ? <Notice kind="error">{error}</Notice> : null}
              {success ? <Notice kind="success">{success}</Notice> : null}
              <AppointmentList
                agendamentos={lista}
                mostrarCliente
                rotuloRemover="Excluir"
                vazioTitulo={filtro === "hoje" ? "Agenda de hoje vazia" : "Nada nos próximos dias"}
                vazioTexto="Quando um cliente marcar um horário com você, ele aparece aqui."
                onDelete={handleDelete}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}

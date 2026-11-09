"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppointmentList from "@/components/AppointmentList";
import BookingForm from "@/components/BookingForm";
import Navbar from "@/components/Navbar";
import Notice from "@/components/Notice";
import {
  ApiError,
  deleteAgendamento,
  listAgendamentos,
  listBarbeiros,
  type Agendamento,
  type Barbeiro,
} from "@/lib/api";
import { clearToken, getUserTipo, sessaoValida } from "@/lib/auth";
import { formatarDia, hojeISO } from "@/lib/datas";

export default function AgendarPage() {
  const router = useRouter();
  const [meus, setMeus] = useState<Agendamento[]>([]);
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sessaoExpirada = useCallback(() => {
    clearToken();
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    if (!sessaoValida()) {
      sessaoExpirada();
      return;
    }
    if (getUserTipo() === "barbeiro") {
      router.replace("/barbeiro");
      return;
    }

    let ativo = true;
    Promise.all([listAgendamentos(), listBarbeiros()])
      .then(([dados, lista]) => {
        if (!ativo) return;
        setMeus(dados);
        setBarbeiros(lista);
      })
      .catch((e) => {
        if (!ativo) return;
        if (e instanceof ApiError && e.status === 401) {
          sessaoExpirada();
          return;
        }
        setError(e instanceof Error ? e.message : "Não foi possível carregar seus horários.");
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, [router, sessaoExpirada]);

  function handleCreated(novo: Agendamento) {
    setError(null);
    setSuccess(
      `Horário confirmado: ${formatarDia(novo.data)} às ${novo.horario}, com ${novo.barbeiro}.`,
    );
    setMeus((atual) => [...atual, novo]);
  }

  async function handleDelete(id: number) {
    setError(null);
    setSuccess(null);
    try {
      await deleteAgendamento(id);
      setMeus((atual) => atual.filter((a) => a.id !== id));
      setSuccess("Horário cancelado.");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        sessaoExpirada();
        return;
      }
      setError(e instanceof Error ? e.message : "Não foi possível cancelar.");
    }
  }

  const hoje = hojeISO();
  const proximos = meus.filter((a) => a.data >= hoje);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <header>
          <h1 className="font-display text-4xl font-semibold leading-none text-navy sm:text-5xl">
            Agendar horário
          </h1>
          <p className="mt-3 max-w-xl text-muted">
            Escolha o barbeiro, o dia e o horário. Os horários que você já marcou ficam ao lado.
          </p>
        </header>

        {loading ? (
          <p className="mt-10 text-muted">Carregando...</p>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
            <section aria-labelledby="titulo-novo" className="card p-6 sm:p-8">
              <h2 id="titulo-novo" className="mb-6 font-display text-2xl font-semibold text-navy">
                Novo horário
              </h2>
              <BookingForm
                barbeiros={barbeiros}
                onCreated={handleCreated}
                onUnauthorized={sessaoExpirada}
              />
            </section>

            <section aria-labelledby="titulo-meus" className="flex flex-col gap-4 lg:sticky lg:top-6">
              <h2 id="titulo-meus" className="font-display text-2xl font-semibold text-navy">
                Meus horários
              </h2>
              {error ? <Notice kind="error">{error}</Notice> : null}
              {success ? <Notice kind="success">{success}</Notice> : null}
              <AppointmentList
                agendamentos={proximos}
                mostrarCliente={false}
                rotuloRemover="Cancelar"
                vazioTitulo="Nenhum horário marcado"
                vazioTexto="Escolha um barbeiro, um dia e um horário para agendar."
                onDelete={handleDelete}
              />
            </section>
          </div>
        )}
      </main>
    </>
  );
}

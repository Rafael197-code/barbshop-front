"use client";

import { useState } from "react";
import type { Agendamento } from "@/lib/api";
import { formatarDia, hojeISO } from "@/lib/datas";
import Icon from "./Icon";

type AppointmentListProps = {
  agendamentos: Agendamento[];

  mostrarCliente: boolean;

  rotuloRemover: string;
  vazioTitulo: string;
  vazioTexto: string;
  onDelete: (id: number) => Promise<void>;
};

export default function AppointmentList({
  agendamentos,
  mostrarCliente,
  rotuloRemover,
  vazioTitulo,
  vazioTexto,
  onDelete,
}: AppointmentListProps) {
  const hoje = hojeISO();
  const [confirmando, setConfirmando] = useState<number | null>(null);
  const [removendo, setRemovendo] = useState<number | null>(null);

  if (agendamentos.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-line bg-white px-6 py-10">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-tint text-navy">
          <Icon name="calendar" className="h-6 w-6" />
        </span>
        <p className="font-display text-2xl font-semibold text-navy">{vazioTitulo}</p>
        <p className="max-w-sm text-muted">{vazioTexto}</p>
      </div>
    );
  }

  const ordenados = [...agendamentos].sort((a, b) =>
    `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`),
  );

  const grupos = ordenados.reduce<Record<string, Agendamento[]>>((acc, item) => {
    (acc[item.data] ??= []).push(item);
    return acc;
  }, {});

  async function remover(id: number) {
    setRemovendo(id);
    try {
      await onDelete(id);
    } finally {
      setRemovendo(null);
      setConfirmando(null);
    }
  }

  return (
    <div className="flex flex-col gap-7">
      {Object.entries(grupos).map(([dia, itens]) => (
        <section key={dia}>
          <h3 className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
            <span className="flex items-baseline gap-2 font-display text-xl font-semibold text-navy">
              <span className="first-letter:uppercase">{formatarDia(dia)}</span>
              {dia === hoje ? (
                <span className="rounded-sm bg-red px-1.5 py-0.5 font-sans text-xs font-semibold text-white">
                  Hoje
                </span>
              ) : null}
            </span>
            <span className="shrink-0 text-sm text-muted">
              {itens.length} {itens.length === 1 ? "horário" : "horários"}
            </span>
          </h3>

          <ul className="mt-3 flex flex-col gap-2.5">
            {itens.map((item) => (
              <li
                key={item.id}
                className="flex items-stretch overflow-hidden rounded-md border border-line bg-white"
              >
                <div className="flex w-[4.75rem] shrink-0 items-center justify-center bg-navy px-2 py-3 text-white">
                  <span className="font-display text-2xl font-semibold leading-none tabular-nums">
                    {item.horario}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2 border-l border-dashed border-line px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">
                      {mostrarCliente ? item.cliente : `Com ${item.barbeiro}`}
                    </p>
                  </div>

                  {confirmando === item.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => remover(item.id)}
                        disabled={removendo === item.id}
                        className="btn btn-sm btn-accent"
                      >
                        {removendo === item.id ? "Aguarde..." : "Confirmar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmando(null)}
                        disabled={removendo === item.id}
                        className="btn btn-sm btn-outline"
                      >
                        Manter
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmando(item.id)}
                      className="btn btn-sm btn-quiet"
                      aria-label={`${rotuloRemover} horário das ${item.horario}${
                        mostrarCliente ? ` de ${item.cliente}` : ` com ${item.barbeiro}`
                      }`}
                    >
                      {rotuloRemover}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

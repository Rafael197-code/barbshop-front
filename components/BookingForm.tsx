"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ApiError,
  createAgendamento,
  listOcupados,
  type Agendamento,
  type Barbeiro,
} from "@/lib/api";
import { HORARIOS, agoraHHMM, hojeISO, proximosDias } from "@/lib/datas";
import Icon from "./Icon";
import Notice from "./Notice";

type BookingFormProps = {
  barbeiros: Barbeiro[];
  onCreated: (agendamento: Agendamento) => void;
  onUnauthorized: () => void;
};

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1][0] ?? "") : "";
  return (primeira + ultima).toUpperCase();
}

function mesCurto(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
}

function Passo({
  numero,
  titulo,
  children,
}: {
  numero: number;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 p-0">
        <span className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-sm bg-navy font-display text-base font-semibold text-white"
          >
            {numero}
          </span>
          <span className="font-display text-xl font-semibold text-navy">{titulo}</span>
        </span>
      </legend>
      {children}
    </fieldset>
  );
}

export default function BookingForm({ barbeiros, onCreated, onUnauthorized }: BookingFormProps) {
  const dias = useMemo(() => proximosDias(14), []);
  const hoje = hojeISO();

  const [barbeiroId, setBarbeiroId] = useState<number | null>(null);
  const [data, setData] = useState(dias[0].iso);
  const [horario, setHorario] = useState("");
  const [ocupados, setOcupados] = useState<{ chave: string; horarios: string[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  const chave = barbeiroId === null ? "" : `${barbeiroId}|${data}`;

  useEffect(() => {
    if (barbeiroId === null) return;

    let ativo = true;
    listOcupados(barbeiroId, data)
      .then((lista) => {
        if (ativo) setOcupados({ chave: `${barbeiroId}|${data}`, horarios: lista });
      })
      .catch((e) => {
        if (!ativo) return;
        if (e instanceof ApiError && e.status === 401) {
          onUnauthorized();
          return;
        }
        setError(e instanceof Error ? e.message : "Não foi possível carregar os horários.");
      });

    return () => {
      ativo = false;
    };
  }, [barbeiroId, data, versao, onUnauthorized]);

  const barbeiro = barbeiros.find((b) => b.id === barbeiroId);
  const diaEscolhido = dias.find((d) => d.iso === data);
  const carregando = barbeiroId !== null && ocupados?.chave !== chave;
  const ocupadosDoDia = ocupados && ocupados.chave === chave ? ocupados.horarios : [];
  const agora = agoraHHMM();
  const semLista = barbeiroId === null || carregando;

  function indisponivel(h: string) {
    return ocupadosDoDia.includes(h) || (data === hoje && h <= agora);
  }

  function escolherBarbeiro(id: number) {
    setBarbeiroId(id);
    setHorario("");
    setError(null);
  }

  function escolherDia(iso: string) {
    setData(iso);
    setHorario("");
    setError(null);
  }

  function recarregarHorarios() {
    setHorario("");
    setOcupados(null);
    setVersao((v) => v + 1);
  }

  async function agendar() {
    if (barbeiroId === null || !horario) return;
    setError(null);
    setSaving(true);
    try {
      const criado = await createAgendamento({ barbeiroId, data, horario });
      onCreated(criado);
      recarregarHorarios();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        onUnauthorized();
        return;
      }
      setError(e instanceof Error ? e.message : "Não foi possível agendar.");
      if (e instanceof ApiError && e.status === 409) recarregarHorarios();
    } finally {
      setSaving(false);
    }
  }

  const completo = Boolean(barbeiro && horario && diaEscolhido);

  return (
    <div className="flex flex-col gap-8">
      <Passo numero={1} titulo="Barbeiro">
        {barbeiros.length === 0 ? (
          <p className="text-muted">Nenhum barbeiro cadastrado ainda.</p>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {barbeiros.map((b) => (
              <label key={b.id} className="group block cursor-pointer">
                <input
                  type="radio"
                  name="barbeiro"
                  className="peer sr-only"
                  checked={barbeiroId === b.id}
                  onChange={() => escolherBarbeiro(b.id)}
                />
                <span className="flex items-center gap-3 rounded-md border border-line bg-white p-3 transition-colors hover:border-navy peer-checked:border-navy peer-checked:bg-tint peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-navy font-display text-lg font-semibold text-white group-has-[:checked]:bg-red"
                  >
                    {iniciais(b.nome)}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-ink">{b.nome}</span>
                  <Icon
                    name="check"
                    className="hidden h-5 w-5 shrink-0 text-navy group-has-[:checked]:block"
                  />
                </span>
              </label>
            ))}
          </div>
        )}
      </Passo>

      <Passo numero={2} titulo="Dia">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {dias.map((d) => {
            const sel = data === d.iso;
            return (
              <button
                key={d.iso}
                type="button"
                aria-pressed={sel}
                onClick={() => escolherDia(d.iso)}
                className={`flex h-[4.75rem] flex-col items-center justify-center rounded-md border text-center transition-colors ${
                  sel
                    ? "border-navy bg-navy text-white"
                    : "border-line bg-white text-ink hover:border-navy hover:bg-tint"
                }`}
              >
                <span className={`text-xs font-semibold capitalize ${sel ? "text-white/80" : "text-muted"}`}>
                  {d.semana}
                </span>
                <span className="font-display text-2xl font-semibold leading-none">{d.numero}</span>
                <span className={`text-xs ${sel ? "text-white/80" : "text-muted"}`}>
                  {mesCurto(d.iso)}
                </span>
              </button>
            );
          })}
        </div>
      </Passo>

      <Passo numero={3} titulo="Horário">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5" aria-busy={carregando}>
          {HORARIOS.map((h) => {
            const bloqueado = semLista || indisponivel(h);
            return (
              <button
                key={h}
                type="button"
                disabled={bloqueado}
                aria-pressed={horario === h}
                onClick={() => setHorario(h)}
                className={`h-11 rounded-md border text-sm font-semibold tabular-nums transition-colors ${
                  horario === h
                    ? "border-navy bg-navy text-white"
                    : "border-line bg-white text-ink hover:border-navy hover:bg-tint"
                } disabled:cursor-not-allowed disabled:border-line disabled:bg-paper disabled:text-muted/60 disabled:hover:bg-paper ${
                  semLista ? "" : "disabled:line-through"
                }`}
              >
                {h}
              </button>
            );
          })}
        </div>

        {barbeiroId === null ? (
          <p className="mt-3 text-sm text-muted">Escolha um barbeiro para ver os horários livres.</p>
        ) : carregando ? (
          <p className="mt-3 text-sm text-muted">Carregando horários...</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm border border-line bg-white" />
              Livre
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-navy" />
              Escolhido
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm border border-line bg-paper" />
              Ocupado ou já passou
            </li>
          </ul>
        )}
      </Passo>

      {error ? <Notice kind="error">{error}</Notice> : null}

      <div className="rounded-md bg-tint p-4 sm:p-5">
        {completo && barbeiro && diaEscolhido ? (
          <ul className="flex flex-col gap-2.5 text-ink">
            <li className="flex items-center gap-3">
              <Icon name="calendar" className="h-5 w-5 shrink-0 text-navy" />
              <span className="block font-semibold first-letter:uppercase">{diaEscolhido.rotulo}</span>
            </li>
            <li className="flex items-center gap-3">
              <Icon name="clock" className="h-5 w-5 shrink-0 text-navy" />
              <span className="font-semibold tabular-nums">{horario}</span>
            </li>
            <li className="flex items-center gap-3">
              <Icon name="scissors" className="h-5 w-5 shrink-0 text-navy" />
              <span className="font-semibold">{barbeiro.nome}</span>
            </li>
          </ul>
        ) : (
          <p className="text-muted">Escolha barbeiro, dia e horário para continuar.</p>
        )}

        <button
          type="button"
          onClick={agendar}
          disabled={!completo || saving}
          className="btn btn-accent mt-4 w-full sm:w-auto"
        >
          {saving ? "Agendando..." : "Confirmar horário"}
        </button>
      </div>
    </div>
  );
}

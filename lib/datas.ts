function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function hojeISO(): string {
  return toISO(new Date());
}

export function agoraHHMM(): string {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatarDia(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

export type Dia = { iso: string; semana: string; numero: string; rotulo: string };

export function proximosDias(quantidade: number): Dia[] {
  const base = new Date();
  base.setHours(12, 0, 0, 0);

  return Array.from({ length: quantidade }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return {
      iso: toISO(d),
      semana: i === 0 ? "Hoje" : i === 1 ? "Amanhã" : d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
      numero: String(d.getDate()),
      rotulo: formatarDia(toISO(d)),
    };
  });
}

export const HORARIOS: string[] = Array.from({ length: 20 }, (_, i) => {
  const minutos = 9 * 60 + i * 30;
  return `${pad(Math.floor(minutos / 60))}:${pad(minutos % 60)}`;
});

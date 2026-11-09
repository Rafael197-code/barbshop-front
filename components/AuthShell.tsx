import Icon from "./Icon";
import Logo from "./Logo";

export const linkClasse =
  "font-semibold text-navy underline underline-offset-4 hover:text-red-deep";

type Destaque = {
  titulo: string;
  itens: string[];
};

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  destaque?: Destaque;
};

const DESTAQUE_PADRAO: Destaque = {
  titulo: "Seu horário marcado, sem fila.",
  itens: [
    "Escolha o barbeiro de sua confiança",
    "Veja só os horários livres",
    "Confirme em poucos toques",
  ],
};

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  destaque = DESTAQUE_PADRAO,
}: AuthShellProps) {
  return (
    <main className="bg-navy text-white">
      <div className="mx-auto grid min-h-dvh max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1fr_27rem] lg:gap-20">
       
        <section className="on-navy flex flex-col gap-12 lg:min-h-[30rem] lg:justify-between">
          <Logo fundo="escuro" />

          <div className="hidden lg:block">
            <p className="max-w-md font-display text-6xl font-semibold leading-[1.05] tracking-tight">
              {destaque.titulo}
            </p>
            <ul className="mt-8 flex flex-col gap-3 text-lg text-white/85">
              {destaque.itens.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-red text-white">
                    <Icon name="check" className="h-4 w-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div aria-hidden="true" className="ruler hidden w-72 text-white/35 lg:block" />
        </section>

        <section className="overflow-hidden rounded-lg bg-white text-ink shadow-card">
          <div aria-hidden="true" className="stripes h-1.5" />
          <div className="p-7 sm:p-9">
            <h1 className="font-display text-4xl font-semibold leading-none text-navy">{title}</h1>
            <p className="mt-3 text-muted">{subtitle}</p>
            <div className="mt-7">{children}</div>
            <div className="mt-8 border-t border-line pt-6 text-sm text-muted">{footer}</div>
          </div>
        </section>
      </div>
    </main>
  );
}

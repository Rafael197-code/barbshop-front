"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { clearToken, getUserNome, getUserTipo } from "@/lib/auth";
import Icon from "./Icon";
import Logo from "./Logo";

const semAssinatura = () => () => {};

export default function Navbar() {
  const router = useRouter();
  const nome = useSyncExternalStore(semAssinatura, getUserNome, () => null);
  const tipo = useSyncExternalStore(semAssinatura, getUserTipo, () => null);

  function sair() {
    clearToken();
    router.push("/login");
  }

  return (
    <header className="on-navy bg-navy text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Logo fundo="escuro" />
        <div className="flex min-w-0 items-center gap-4">
          {nome ? (
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-semibold leading-tight">{nome}</p>
              <p className="text-xs text-white/70">{tipo === "barbeiro" ? "Barbeiro" : "Cliente"}</p>
            </div>
          ) : null}
          <button type="button" onClick={sair} className="btn btn-sm btn-outline-light shrink-0">
            <Icon name="logout" className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
      <div aria-hidden="true" className="stripes h-1" />
    </header>
  );
}

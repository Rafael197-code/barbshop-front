"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { homeDoUsuario, sessaoValida } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(sessaoValida() ? homeDoUsuario() : "/login");
  }, [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <p className="text-muted">Carregando...</p>
    </main>
  );
}

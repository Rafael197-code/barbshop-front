"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell, { linkClasse } from "@/components/AuthShell";
import Field from "@/components/Field";
import Icon from "@/components/Icon";
import Notice from "@/components/Notice";
import { login } from "@/lib/api";
import { homeDoUsuario, sessaoValida, setToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessaoValida()) router.replace(homeDoUsuario());
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !senha) {
      setError("Informe e-mail e senha.");
      return;
    }

    setLoading(true);
    try {
      const token = await login({ email: email.trim(), senha });
      setToken(token);
      router.push(homeDoUsuario());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Entrar"
      subtitle="Entre para agendar o seu horário."
      footer={
        <div className="flex flex-col gap-4">
          <p>
            Ainda não tem conta?{" "}
            <Link href="/register" className={linkClasse}>
              Criar conta
            </Link>
          </p>
          <Link href="/barbeiro/entrar" className="btn btn-outline w-full">
            <Icon name="scissors" className="h-5 w-5" />
            Entrar como barbeiro
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <Field
          id="email"
          label="E-mail"
          type="email"
          icon="mail"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="senha"
          label="Senha"
          type="password"
          icon="lock"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {error ? <Notice kind="error">{error}</Notice> : null}

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </AuthShell>
  );
}

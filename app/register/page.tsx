"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell, { linkClasse } from "@/components/AuthShell";
import Field from "@/components/Field";
import Notice from "@/components/Notice";
import { login, register } from "@/lib/api";
import { homeDoUsuario, setToken } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!nome.trim() || !email.trim() || !senha) {
      setError("Preencha todos os campos.");
      return;
    }
    if (senha.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await register({ nome: nome.trim(), email: email.trim(), senha });
      // Conta criada: já entra direto, sem pedir login de novo.
      const token = await login({ email: email.trim(), senha });
      setToken(token);
      router.push(homeDoUsuario());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível criar a conta.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Cadastre-se para marcar seus horários."
      footer={
        <p>
          Já tem conta?{" "}
          <Link href="/login" className={linkClasse}>
            Entrar
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <Field
          id="nome"
          label="Nome"
          icon="user"
          autoComplete="name"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
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
          autoComplete="new-password"
          hint="Mínimo de 6 caracteres."
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {error ? <Notice kind="error">{error}</Notice> : null}

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>
    </AuthShell>
  );
}

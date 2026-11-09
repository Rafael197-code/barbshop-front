"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell, { linkClasse } from "@/components/AuthShell";
import Field from "@/components/Field";
import Notice from "@/components/Notice";
import { loginBarbeiro, registerBarbeiro } from "@/lib/api";
import { homeDoUsuario, sessaoValida, setToken } from "@/lib/auth";
import { hojeISO } from "@/lib/datas";

type BarbeiroFormProps = {
  modo: "entrar" | "cadastrar";
};

const DESTAQUE_ENTRAR = {
  titulo: "Sua agenda, organizada.",
  itens: [
    "Veja só os clientes que marcaram com você",
    "Acompanhe hoje e os próximos dias",
    "Gerencie os horários dos seus clientes",
  ],
};

const DESTAQUE_CADASTRAR = {
  titulo: "Entre para a equipe.",
  itens: [
    "Os clientes passam a escolher você",
    "Cada barbeiro tem a própria agenda",
    "O cadastro usa a senha da barbearia",
  ],
};

export default function BarbeiroForm({ modo }: BarbeiroFormProps) {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cadastrando = modo === "cadastrar";

  useEffect(() => {
    if (sessaoValida()) router.replace(homeDoUsuario());
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!senha) {
      setError("Informe a senha da barbearia.");
      return;
    }
    if (nome.trim().split(/\s+/).length < 2) {
      setError("Informe o nome completo.");
      return;
    }
    if (!dataNascimento) {
      setError("Informe a data de nascimento.");
      return;
    }

    setLoading(true);
    try {
      const dados = { senha, nome: nome.trim(), dataNascimento };
      if (cadastrando) await registerBarbeiro(dados);
      const token = await loginBarbeiro(dados);
      setToken(token);
      router.push("/barbeiro");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível continuar.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={cadastrando ? "Cadastrar barbeiro" : "Área do barbeiro"}
      subtitle={
        cadastrando
          ? "Depois do cadastro, os clientes passam a escolher você na hora de agendar."
          : "Entre para ver os clientes que agendaram com você."
      }
      destaque={cadastrando ? DESTAQUE_CADASTRAR : DESTAQUE_ENTRAR}
      footer={
        cadastrando ? (
          <p>
            Já está cadastrado?{" "}
            <Link href="/barbeiro/entrar" className={linkClasse}>
              Entrar como barbeiro
            </Link>
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <p>
              Ainda não está na lista?{" "}
              <Link href="/barbeiro/cadastro" className={linkClasse}>
                Cadastrar barbeiro
              </Link>
            </p>
            <p>
              É cliente?{" "}
              <Link href="/login" className={linkClasse}>
                Entrar como cliente
              </Link>
            </p>
          </div>
        )
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <Field
          id="senha-barbearia"
          label="Senha da barbearia"
          type="password"
          icon="lock"
          autoComplete="off"
          hint="A mesma senha para todos os barbeiros."
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <Field
          id="nome-completo"
          label="Nome completo"
          icon="user"
          autoComplete="name"
          placeholder="Ex.: Rafael Mendes Costa"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <Field
          id="data-nascimento"
          label="Data de nascimento"
          type="date"
          min="1920-01-01"
          max={hojeISO()}
          autoComplete="bday"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
        />

        {error ? <Notice kind="error">{error}</Notice> : null}

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Aguarde..." : cadastrando ? "Cadastrar e entrar" : "Entrar"}
        </button>
      </form>
    </AuthShell>
  );
}

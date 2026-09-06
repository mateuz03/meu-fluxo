import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — Meu Financeiro" },
      {
        name: "description",
        content: "Acesse sua conta do Meu Financeiro para acompanhar receitas, despesas, metas e investimentos.",
      },
      { property: "og:title", content: "Entrar — Meu Financeiro" },
      { property: "og:description", content: "Entre ou crie sua conta para organizar suas finanças pessoais." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível entrar", { description: error.message });
      return;
    }
    navigate({ to: "/", replace: true });
  }

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { full_name: nome },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível criar a conta", { description: error.message });
      return;
    }
    if (data.session) {
      navigate({ to: "/", replace: true });
    } else {
      toast.success("Confirme seu e-mail", {
        description: "Enviamos um link de confirmação para " + email,
      });
    }
  }

  async function recuperar() {
    if (!email) {
      toast.error("Informe seu e-mail para receber o link.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (error) {
      toast.error("Falha ao enviar o link", { description: error.message });
      return;
    }
    toast.success("Link enviado", { description: "Confira sua caixa de entrada." });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary font-display text-2xl font-bold text-primary-foreground">
            M
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Meu Financeiro</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Seus dados são privados e visíveis apenas para você.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acesse sua conta</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="entrar">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="entrar">Entrar</TabsTrigger>
                <TabsTrigger value="criar">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="entrar">
                <form className="space-y-4 pt-4" onSubmit={entrar}>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="senha">Senha</Label>
                    <Input id="senha" type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                  <button type="button" onClick={recuperar} className="w-full text-xs text-muted-foreground underline">
                    Esqueci minha senha
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="criar">
                <form className="space-y-4 pt-4" onSubmit={cadastrar}>
                  <div className="space-y-1.5">
                    <Label htmlFor="nome">Nome</Label>
                    <Input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email2">E-mail</Label>
                    <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="senha2">Senha</Label>
                    <Input
                      id="senha2"
                      type="password"
                      required
                      minLength={6}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Criando..." : "Criar conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Este aplicativo organiza suas finanças e não constitui recomendação financeira.
        </p>
      </div>
    </div>
  );
}

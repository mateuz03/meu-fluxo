import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Download, LogOut, ShieldCheck, Tags, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { RecordDialog, type Field } from "@/components/record-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useRows, useSaveProfile } from "@/lib/db";
import { fromCents, toCents } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({ meta: [{ title: "Ajustes — Meu Financeiro" }] }),
  component: ConfiguracoesPage,
});

const categoryFields: Field[] = [
  { name: "name", label: "Nome da categoria", type: "text", required: true },
  {
    name: "kind",
    label: "Tipo",
    type: "select",
    required: true,
    default: "despesa",
    options: [
      { value: "despesa", label: "Despesa" },
      { value: "receita", label: "Receita" },
    ],
  },
];

function ConfiguracoesPage() {
  const profile = useProfile();
  const categories = useRows<Tables<"categories">>("categories", { orderBy: "name" });
  const saveProfile = useSaveProfile();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [income, setIncome] = useState("");
  const [payday, setPayday] = useState("");
  const [goal, setGoal] = useState("");
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    if (!profile.data) return;
    setName(profile.data.full_name ?? "");
    setIncome(String(fromCents(profile.data.monthly_income_cents)).replace(".", ","));
    setPayday(profile.data.payday ? String(profile.data.payday) : "");
    setGoal(profile.data.main_goal ?? "");
    setTheme(profile.data.theme);
  }, [profile.data]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await saveProfile.mutateAsync({
      full_name: name.trim() || null,
      currency: "BRL",
      monthly_income_cents: toCents(income),
      payday: payday ? Number(payday) : null,
      main_goal: goal.trim() || null,
      theme,
    });
    if (theme === "system") {
      localStorage.removeItem("meu-financeiro-theme");
      document.documentElement.classList.toggle(
        "dark",
        window.matchMedia("(prefers-color-scheme: dark)").matches,
      );
    } else {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("meu-financeiro-theme", theme);
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      toast.error("Não foi possível sair. Tente novamente.");
      return;
    }
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Ajustes" description="Preferências e dados da sua conta" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4" /> Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={submit}>
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Nome</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-income">Renda mensal estimada</Label>
                  <Input
                    id="profile-income"
                    inputMode="decimal"
                    value={income}
                    onChange={(event) => setIncome(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-payday">Dia de recebimento</Label>
                  <Input
                    id="profile-payday"
                    type="number"
                    min={1}
                    max={31}
                    value={payday}
                    onChange={(event) => setPayday(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-goal">Objetivo principal</Label>
                <Input
                  id="profile-goal"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-theme">Tema</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="profile-theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">Automático</SelectItem>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={saveProfile.isPending}>
                {saveProfile.isPending ? "Salvando..." : "Salvar preferências"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tags className="h-4 w-4" /> Categorias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(categories.data ?? []).map((category) => (
                <span
                  key={category.id}
                  className="rounded-full border px-3 py-1 text-xs"
                  style={{ borderColor: category.color }}
                >
                  {category.name} · {category.kind}
                </span>
              ))}
            </div>
            <RecordDialog
              table="categories"
              title="Nova categoria"
              fields={categoryFields}
              label="Nova categoria"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-4 w-4" /> Meus dados
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="text-sm text-muted-foreground">
              Exporte seus lançamentos em CSV pela área de relatórios.
            </p>
            <Button size="sm" variant="outline" className="w-fit gap-1.5" asChild>
              <Link to="/relatorios">
                <Download className="h-4 w-4" /> Abrir exportação
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LogOut className="h-4 w-4" /> Sessão
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="text-sm text-muted-foreground">
              Sair remove somente esta sessão do dispositivo atual.
            </p>
            <Button size="sm" variant="outline" className="w-fit gap-1.5" onClick={logout}>
              <LogOut className="h-4 w-4" /> Sair da conta
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4" /> Segurança e privacidade
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Seus registros são protegidos por autenticação e pelas políticas de acesso por usuário
            do banco. Esta aplicação é uma ferramenta de organização financeira pessoal. As
            informações, cálculos e projeções apresentadas não constituem recomendação financeira,
            contábil, tributária ou de investimento. Verifique decisões importantes com um
            profissional qualificado.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

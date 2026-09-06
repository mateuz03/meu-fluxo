import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Wallet, CreditCard, ShieldCheck } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { brl, shortDate } from "@/lib/format";
import {
  despesasPorCategoria,
  evolucaoPatrimonio,
  fluxoMensal,
  movimentos,
  orcamentos,
  recorrentes,
  resumoMes,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Visão geral — Meu Financeiro" },
      {
        name: "description",
        content:
          "Painel de gestão financeira pessoal com saldo, receitas, despesas, orçamentos e metas em um só lugar.",
      },
      { property: "og:title", content: "Visão geral — Meu Financeiro" },
      {
        property: "og:description",
        content: "Acompanhe saldo, fluxo de caixa, orçamentos e metas do mês.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const ultimos = movimentos.slice(0, 6);
  const reserva = (resumoMes.reservaEmergencia / resumoMes.reservaMeta) * 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão geral"
        description={`Referência: ${resumoMes.referencia}`}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to="/relatorios">Ver relatórios</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saldo atual" value={brl(resumoMes.saldoAtual)} icon={Wallet} tone="info" hint="Somatório das contas" />
        <StatCard label="Receitas do mês" value={brl(resumoMes.receitas)} icon={ArrowUpRight} tone="success" hint="+3,2% vs. agosto" />
        <StatCard label="Despesas do mês" value={brl(resumoMes.despesas)} icon={ArrowDownRight} tone="destructive" hint="65% da receita" />
        <StatCard label="Faturas abertas" value={brl(resumoMes.faturasAbertas)} icon={CreditCard} tone="warning" hint="3 cartões" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Fluxo de caixa</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fluxoMensal} barGap={4}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} tickLine={false} axisLine={false} fontSize={12} width={36} />
                <Tooltip
                  formatter={(v: number) => brl(v)}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-popover-foreground)",
                  }}
                />
                <Bar dataKey="receitas" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="despesas" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={despesasPorCategoria} dataKey="valor" nameKey="categoria" innerRadius={52} outerRadius={82} paddingAngle={3}>
                  {despesasPorCategoria.map((d) => (
                    <Cell key={d.categoria} fill={d.cor} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => brl(v)}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-popover-foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Últimos lançamentos</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/transacoes">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {ultimos.map((m) => (
              <div key={m.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.descricao}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.categoria} · {m.conta} · {shortDate(m.data)}
                  </p>
                </div>
                <span
                  className={`num shrink-0 text-sm font-semibold ${m.tipo === "receita" ? "text-success" : "text-destructive"}`}
                >
                  {m.tipo === "receita" ? "+" : "−"} {brl(m.valor)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reserva de emergência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={reserva} />
              <p className="num text-sm text-muted-foreground">
                {brl(resumoMes.reservaEmergencia)} de {brl(resumoMes.reservaMeta)}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-success" /> Cobre 5 meses de custo fixo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contas do mês</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recorrentes.slice(0, 4).map((r) => (
                <div key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{r.nome}</p>
                    <p className="text-xs text-muted-foreground">dia {r.dia}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="num text-sm font-medium">{brl(r.valor)}</span>
                    <Badge variant={r.status === "pago" ? "secondary" : "outline"}>{r.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolução do patrimônio</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolucaoPatrimonio}>
                <defs>
                  <linearGradient id="pat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} tickLine={false} axisLine={false} fontSize={12} width={40} />
                <Tooltip
                  formatter={(v: number) => brl(v)}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-popover-foreground)",
                  }}
                />
                <Area dataKey="valor" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#pat)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Orçamentos</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orcamentos">Gerenciar</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {orcamentos.slice(0, 4).map((o) => {
              const p = (o.gasto / o.limite) * 100;
              return (
                <div key={o.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{o.categoria}</span>
                    <span className={`num ${p > 100 ? "text-destructive" : "text-muted-foreground"}`}>
                      {brl(o.gasto)} / {brl(o.limite)}
                    </span>
                  </div>
                  <Progress value={Math.min(p, 100)} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

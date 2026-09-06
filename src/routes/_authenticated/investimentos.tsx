import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { brl, pct } from "@/lib/format";
import { investimentos } from "@/lib/mock-data";

export const Route = createFileRoute("/investimentos")({
  head: () => ({
    meta: [
      { title: "Investimentos — Meu Financeiro" },
      {
        name: "description",
        content: "Acompanhe sua carteira por classe de ativo, valor aplicado e rentabilidade.",
      },
      { property: "og:title", content: "Investimentos — Meu Financeiro" },
      {
        property: "og:description",
        content: "Acompanhe sua carteira por classe de ativo, valor aplicado e rentabilidade.",
      },
    ],
  }),
  component: InvestimentosPage,
});

const cores = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function InvestimentosPage() {
  const total = investimentos.reduce((s, i) => s + i.valor, 0);
  const media =
    investimentos.reduce((s, i) => s + i.rentabilidade * i.valor, 0) / (total || 1);

  const porClasse = Object.values(
    investimentos.reduce<Record<string, { classe: string; valor: number }>>((acc, i) => {
      acc[i.classe] = { classe: i.classe, valor: (acc[i.classe]?.valor ?? 0) + i.valor };
      return acc;
    }, {}),
  );

  return (
    <div>
      <PageHeader
        title="Investimentos"
        description="Carteira fictícia para validação do design."
        action={<Button size="sm">Novo aporte</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total investido" value={brl(total)} icon={TrendingUp} tone="info" />
        <StatCard label="Rentabilidade média" value={pct(media, 1)} tone="success" />
        <StatCard label="Ativos" value={String(investimentos.length)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alocação por classe</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={porClasse} dataKey="valor" nameKey="classe" innerRadius={55} outerRadius={90}>
                  {porClasse.map((entry, index) => (
                    <Cell key={entry.classe} fill={cores[index % cores.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => brl(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meus ativos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {investimentos.map((i) => (
              <div
                key={i.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/70 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{i.nome}</p>
                  <p className="text-xs text-muted-foreground">{i.classe}</p>
                </div>
                <div className="text-right">
                  <p className="num text-sm font-semibold">{brl(i.valor)}</p>
                  <Badge variant={i.rentabilidade >= 0 ? "secondary" : "destructive"}>
                    {pct(i.rentabilidade, 1)}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

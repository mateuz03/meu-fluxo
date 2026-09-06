import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Download } from "lucide-react";
import {
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { brl } from "@/lib/format";
import { despesasPorCategoria, fluxoMensal } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Meu Financeiro" },
      {
        name: "description",
        content: "Compare receitas e despesas por mês e veja onde o seu dinheiro está indo.",
      },
      { property: "og:title", content: "Relatórios — Meu Financeiro" },
      {
        property: "og:description",
        content: "Compare receitas e despesas por mês e veja onde o seu dinheiro está indo.",
      },
    ],
  }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const receitas = fluxoMensal.reduce((s, m) => s + m.receitas, 0);
  const despesas = fluxoMensal.reduce((s, m) => s + m.despesas, 0);

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Últimos 6 meses (dados fictícios)."
        action={
          <Button size="sm" variant="outline" className="gap-1.5">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Receitas no período" value={brl(receitas)} tone="success" icon={BarChart3} />
        <StatCard label="Despesas no período" value={brl(despesas)} tone="destructive" />
        <StatCard label="Resultado" value={brl(receitas - despesas)} tone="info" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receitas x despesas</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fluxoMensal}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} width={70} fontSize={12} />
                <Tooltip formatter={(v: number) => brl(v)} />
                <Bar dataKey="receitas" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="despesas" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={despesasPorCategoria}
                  dataKey="valor"
                  nameKey="categoria"
                  innerRadius={50}
                  outerRadius={90}
                >
                  {despesasPorCategoria.map((c) => (
                    <Cell key={c.categoria} fill={c.cor} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => brl(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

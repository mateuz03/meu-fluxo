import { createFileRoute } from "@tanstack/react-router";
import { Landmark } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { brl } from "@/lib/format";
import { dividas, evolucaoPatrimonio, patrimonio } from "@/lib/mock-data";

export const Route = createFileRoute("/patrimonio")({
  head: () => ({
    meta: [
      { title: "Patrimônio — Meu Financeiro" },
      {
        name: "description",
        content: "Veja bens, ativos financeiros e a evolução do seu patrimônio líquido.",
      },
      { property: "og:title", content: "Patrimônio — Meu Financeiro" },
      {
        property: "og:description",
        content: "Veja bens, ativos financeiros e a evolução do seu patrimônio líquido.",
      },
    ],
  }),
  component: PatrimonioPage,
});

function PatrimonioPage() {
  const bens = patrimonio.reduce((s, p) => s + p.valor, 0);
  const passivos = dividas.reduce((s, d) => s + d.saldo, 0);

  return (
    <div>
      <PageHeader
        title="Patrimônio"
        description="Bens, ativos e passivos consolidados."
        action={<Button size="sm">Adicionar bem</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Bens e ativos" value={brl(bens)} icon={Landmark} tone="info" />
        <StatCard label="Passivos" value={brl(passivos)} tone="destructive" />
        <StatCard label="Patrimônio líquido" value={brl(bens - passivos)} tone="success" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Evolução dos últimos meses</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolucaoPatrimonio}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} width={70} fontSize={12} />
              <Tooltip formatter={(v: number) => brl(v)} />
              <Area
                dataKey="valor"
                stroke="var(--color-chart-1)"
                fill="var(--color-chart-1)"
                fillOpacity={0.18}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {patrimonio.map((p) => (
          <Card key={p.id}>
            <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{p.nome}</p>
                <p className="text-xs text-muted-foreground">{p.tipo}</p>
              </div>
              <p className="num text-sm font-semibold">{brl(p.valor)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

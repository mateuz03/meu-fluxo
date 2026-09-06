import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { brl, pct } from "@/lib/format";
import { dividas } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/dividas")({
  head: () => ({
    meta: [
      { title: "Dívidas — Meu Financeiro" },
      {
        name: "description",
        content: "Controle financiamentos e empréstimos: saldo devedor, parcela, juros e prazo.",
      },
      { property: "og:title", content: "Dívidas — Meu Financeiro" },
      {
        property: "og:description",
        content: "Controle financiamentos e empréstimos: saldo devedor, parcela, juros e prazo.",
      },
    ],
  }),
  component: DividasPage,
});

function DividasPage() {
  const saldo = dividas.reduce((s, d) => s + d.saldo, 0);
  const mensal = dividas.reduce((s, d) => s + d.parcela, 0);

  return (
    <div>
      <PageHeader
        title="Dívidas"
        description="Acompanhe o que ainda falta quitar."
        action={<Button size="sm">Nova dívida</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Saldo devedor" value={brl(saldo)} icon={Receipt} tone="destructive" />
        <StatCard label="Parcelas do mês" value={brl(mensal)} tone="warning" />
        <StatCard label="Contratos" value={String(dividas.length)} />
      </div>

      <div className="mt-6 grid gap-3">
        {dividas.map((d) => (
          <Card key={d.id}>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">{d.nome}</p>
                  <Badge variant={d.taxa > 20 ? "destructive" : "secondary"}>
                    {pct(d.taxa, 1)} a.a.
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {d.credor} · {d.restantes} parcelas restantes
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="num text-sm font-semibold">{brl(d.saldo)}</p>
                <p className="text-xs text-muted-foreground">Parcela {brl(d.parcela)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

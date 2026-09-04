import { createFileRoute } from "@tanstack/react-router";
import { Plus, Wallet } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { brl } from "@/lib/format";
import { contas } from "@/lib/mock-data";

export const Route = createFileRoute("/contas")({
  head: () => ({
    meta: [
      { title: "Contas bancárias — Meu Financeiro" },
      { name: "description", content: "Saldos consolidados das suas contas correntes, poupanças e carteiras." },
      { property: "og:title", content: "Contas bancárias — Meu Financeiro" },
      { property: "og:description", content: "Veja o saldo de cada conta e o total consolidado." },
    ],
  }),
  component: Contas,
});

function Contas() {
  const total = contas.reduce((s, c) => s + c.saldo, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas"
        description="Saldos consolidados por instituição"
        action={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Nova conta
          </Button>
        }
      />

      <StatCard label="Saldo consolidado" value={brl(total)} icon={Wallet} tone="info" hint={`${contas.length} contas ativas`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {contas.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center gap-3 p-5">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white"
                style={{ backgroundColor: c.cor }}
              >
                {c.nome.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{c.nome}</p>
                <p className="truncate text-xs text-muted-foreground">{c.tipo}</p>
                <p className="num mt-1 text-lg font-bold">{brl(c.saldo)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

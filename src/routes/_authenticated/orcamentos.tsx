import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { brl, pct } from "@/lib/format";
import { orcamentos } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/orcamentos")({
  head: () => ({
    meta: [
      { title: "Orçamentos mensais — Meu Financeiro" },
      { name: "description", content: "Defina limites por categoria e acompanhe o quanto já foi gasto no mês." },
      { property: "og:title", content: "Orçamentos mensais — Meu Financeiro" },
      { property: "og:description", content: "Limites por categoria com alertas de estouro." },
    ],
  }),
  component: Orcamentos,
});

function Orcamentos() {
  const limite = orcamentos.reduce((s, o) => s + o.limite, 0);
  const gasto = orcamentos.reduce((s, o) => s + o.gasto, 0);
  const estourados = orcamentos.filter((o) => o.gasto > o.limite);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orçamentos"
        description="Limites por categoria em setembro"
        action={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Novo orçamento
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Limite total" value={brl(limite)} />
        <StatCard label="Já utilizado" value={brl(gasto)} hint={pct((gasto / limite) * 100)} />
        <StatCard
          label="Categorias estouradas"
          value={String(estourados.length)}
          icon={AlertTriangle}
          tone="warning"
          hint={estourados.map((e) => e.categoria).join(", ") || "Nenhuma"}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {orcamentos.map((o) => {
          const p = (o.gasto / o.limite) * 100;
          const estourou = p > 100;
          return (
            <Card key={o.id}>
              <CardContent className="space-y-3 p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <p className="truncate font-medium">{o.categoria}</p>
                  <span className={`num shrink-0 text-sm ${estourou ? "text-destructive" : "text-muted-foreground"}`}>
                    {pct(p)}
                  </span>
                </div>
                <Progress value={Math.min(p, 100)} />
                <p className="num text-sm text-muted-foreground">
                  {brl(o.gasto)} de {brl(o.limite)} ·{" "}
                  {estourou ? (
                    <span className="text-destructive">excedeu {brl(o.gasto - o.limite)}</span>
                  ) : (
                    <span>restam {brl(o.limite - o.gasto)}</span>
                  )}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

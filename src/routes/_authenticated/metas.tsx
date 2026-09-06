import { createFileRoute } from "@tanstack/react-router";
import { Plus, Target } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { brl, longDate, pct } from "@/lib/format";
import { metas } from "@/lib/mock-data";

export const Route = createFileRoute("/metas")({
  head: () => ({
    meta: [
      { title: "Metas financeiras — Meu Financeiro" },
      { name: "description", content: "Acompanhe objetivos como reserva de emergência, viagens e entrada de imóvel." },
      { property: "og:title", content: "Metas financeiras — Meu Financeiro" },
      { property: "og:description", content: "Progresso, prazo e aporte sugerido para cada objetivo." },
    ],
  }),
  component: Metas,
});

function Metas() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Metas e objetivos"
        description="Progresso de cada plano financeiro"
        action={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Nova meta
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {metas.map((m) => {
          const p = (m.atual / m.alvo) * 100;
          const meses = Math.max(
            1,
            Math.round((new Date(m.prazo).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)),
          );
          return (
            <Card key={m.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <Target className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{m.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">Prazo: {longDate(m.prazo)}</p>
                  </div>
                </div>
                <Progress value={p} />
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="num text-muted-foreground">
                    {brl(m.atual)} de {brl(m.alvo)}
                  </span>
                  <span className="num font-semibold">{pct(p)}</span>
                </div>
                <p className="num rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Aporte sugerido: {brl((m.alvo - m.atual) / meses)} por mês
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { brl, longDate } from "@/lib/format";
import { agenda, recorrentes } from "@/lib/mock-data";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda financeira — Meu Financeiro" },
      {
        name: "description",
        content: "Próximos vencimentos, recebimentos e contas recorrentes em uma linha do tempo.",
      },
      { property: "og:title", content: "Agenda financeira — Meu Financeiro" },
      {
        property: "og:description",
        content: "Próximos vencimentos, recebimentos e contas recorrentes em uma linha do tempo.",
      },
    ],
  }),
  component: AgendaPage,
});

function AgendaPage() {
  const aPagar = agenda.filter((e) => e.tipo === "despesa").reduce((s, e) => s + e.valor, 0);
  const aReceber = agenda.filter((e) => e.tipo === "receita").reduce((s, e) => s + e.valor, 0);

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Próximos compromissos financeiros."
        action={<Button size="sm">Novo lembrete</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="A pagar" value={brl(aPagar)} icon={CalendarDays} tone="destructive" />
        <StatCard label="A receber" value={brl(aReceber)} tone="success" />
        <StatCard label="Saldo previsto" value={brl(aReceber - aPagar)} tone="info" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Linha do tempo</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {agenda.map((e) => (
              <div
                key={e.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/70 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{e.titulo}</p>
                  <p className="text-xs text-muted-foreground">{longDate(e.data)}</p>
                </div>
                <span
                  className={
                    e.tipo === "receita"
                      ? "num text-sm font-semibold text-success"
                      : "num text-sm font-semibold text-destructive"
                  }
                >
                  {e.tipo === "receita" ? "+" : "-"}
                  {brl(e.valor)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contas recorrentes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {recorrentes.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/70 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{r.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    Todo dia {r.dia} · {r.categoria}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="num text-sm font-semibold">{brl(r.valor)}</span>
                  <Badge variant={r.status === "pago" ? "secondary" : "outline"}>{r.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

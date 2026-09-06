import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { brl } from "@/lib/format";
import { cartoes, parceladas } from "@/lib/mock-data";

export const Route = createFileRoute("/cartoes")({
  head: () => ({
    meta: [
      { title: "Cartões de crédito — Meu Financeiro" },
      { name: "description", content: "Faturas, limites disponíveis e compras parceladas dos seus cartões." },
      { property: "og:title", content: "Cartões de crédito — Meu Financeiro" },
      { property: "og:description", content: "Controle faturas, limites e parcelamentos." },
    ],
  }),
  component: Cartoes,
});

function Cartoes() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cartões"
        description="Faturas, limites e compras parceladas"
        action={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Novo cartão
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cartoes.map((k) => {
          const uso = (k.fatura / k.limite) * 100;
          return (
            <Card key={k.id} className="overflow-hidden">
              <CardContent className="space-y-4 p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{k.nome}</p>
                    <p className="text-xs text-muted-foreground">{k.bandeira}</p>
                  </div>
                  <CreditCard className="h-5 w-5 shrink-0 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Fatura atual</p>
                  <p className="num text-2xl font-bold">{brl(k.fatura)}</p>
                </div>
                <Progress value={uso} />
                <p className="num text-xs text-muted-foreground">
                  Limite disponível {brl(k.limite - k.fatura)} de {brl(k.limite)}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">Fecha {k.fechamento}</Badge>
                  <Badge variant="secondary">Vence {k.vencimento}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compras parceladas</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {parceladas.map((p) => (
            <div key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.descricao}</p>
                <p className="truncate text-xs text-muted-foreground">{p.cartao}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge variant="outline">
                  {p.parcela}/{p.total}
                </Badge>
                <span className="num text-sm font-semibold">{brl(p.valor)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RecordDialog, type Field } from "@/components/record-dialog";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";
import { useRows } from "@/lib/db";
import { brlFromCents, pct } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dividas")({
  head: () => ({ meta: [{ title: "Dívidas — Meu Financeiro" }] }),
  component: DividasPage,
});

const fields: Field[] = [
  {
    name: "name",
    label: "Nome da dívida",
    type: "text",
    required: true,
    placeholder: "Ex.: Financiamento",
  },
  { name: "creditor", label: "Credor", type: "text" },
  { name: "balance_cents", label: "Saldo devedor", type: "money", required: true, min: 0 },
  { name: "installment_cents", label: "Valor da parcela", type: "money", default: "0", min: 0 },
  { name: "interest_rate", label: "Taxa informada (%)", type: "number", min: 0 },
  { name: "remaining_installments", label: "Parcelas restantes", type: "number", min: 0 },
];

function DividasPage() {
  const debts = useRows<Tables<"debts">>("debts", { orderBy: "name" });
  const rows = debts.data ?? [];
  const balance = rows.reduce((sum, debt) => sum + debt.balance_cents, 0);
  const monthly = rows.reduce((sum, debt) => sum + debt.installment_cents, 0);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dívidas"
        description="Acompanhe os valores informados por você"
        action={
          <RecordDialog table="debts" title="Nova dívida" fields={fields} label="Nova dívida" />
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Saldo devedor"
          value={brlFromCents(balance)}
          icon={Receipt}
          tone="destructive"
        />
        <StatCard label="Parcelas do mês" value={brlFromCents(monthly)} tone="warning" />
        <StatCard label="Contratos" value={String(rows.length)} />
      </div>
      {debts.isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Carregando dívidas...</p>
      ) : debts.isError ? (
        <EmptyState
          icon={Receipt}
          title="Não foi possível carregar as dívidas"
          description="Verifique sua conexão e tente novamente."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhuma dívida cadastrada"
          description="Se você tiver empréstimos ou financiamentos, registre-os para compor o patrimônio líquido."
        />
      ) : (
        <div className="grid gap-3">
          {rows.map((debt) => (
            <Card key={debt.id}>
              <CardContent className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold">{debt.name}</p>
                    {debt.interest_rate !== null ? (
                      <Badge variant={debt.interest_rate > 20 ? "destructive" : "secondary"}>
                        {pct(debt.interest_rate, 2)} informada
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {debt.creditor || "Credor não informado"}
                    {debt.remaining_installments !== null
                      ? ` · ${debt.remaining_installments} parcelas restantes`
                      : ""}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="num text-sm font-semibold">{brlFromCents(debt.balance_cents)}</p>
                  <p className="text-xs text-muted-foreground">
                    Parcela {brlFromCents(debt.installment_cents)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

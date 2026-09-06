import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, PiggyBank } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RecordDialog, type Field } from "@/components/record-dialog";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Tables } from "@/integrations/supabase/types";
import { useRows } from "@/lib/db";
import { currentMonthKey } from "@/lib/finance";
import { brlFromCents, pct } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/orcamentos")({
  head: () => ({ meta: [{ title: "Orçamentos mensais — Meu Financeiro" }] }),
  component: Orcamentos,
});

function Orcamentos() {
  const budgets = useRows<Tables<"budgets">>("budgets", { orderBy: "month", ascending: false });
  const categories = useRows<Tables<"categories">>("categories", { orderBy: "name" });
  const transactions = useRows<Tables<"transactions">>("transactions");
  const month = currentMonthKey();
  const categoryById = new Map((categories.data ?? []).map((category) => [category.id, category]));
  const rows = (budgets.data ?? []).filter((budget) => budget.month.startsWith(month));
  const spent = (categoryId: string | null) =>
    (transactions.data ?? [])
      .filter(
        (tx) =>
          tx.category_id === categoryId &&
          tx.type === "despesa" &&
          tx.status !== "cancelado" &&
          tx.occurred_on.startsWith(month),
      )
      .reduce((sum, tx) => sum + tx.amount_cents, 0);
  const limit = rows.reduce((sum, budget) => sum + budget.limit_cents, 0);
  const used = rows.reduce((sum, budget) => sum + spent(budget.category_id), 0);
  const exceeded = rows.filter((budget) => spent(budget.category_id) > budget.limit_cents);
  const fields: Field[] = [
    {
      name: "category_id",
      label: "Categoria",
      type: "select",
      required: true,
      options: (categories.data ?? [])
        .filter((category) => category.kind === "despesa" && !category.archived)
        .map((category) => ({ value: category.id, label: category.name })),
    },
    {
      name: "month",
      label: "Mês de referência",
      type: "date",
      required: true,
      default: `${month}-01`,
    },
    { name: "limit_cents", label: "Limite mensal", type: "money", required: true, min: 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orçamentos"
        description={`Limites por categoria em ${new Date(`${month}-02T12:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`}
        action={
          <RecordDialog
            table="budgets"
            title="Novo orçamento"
            fields={fields}
            label="Novo orçamento"
          />
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Limite total" value={brlFromCents(limit)} />
        <StatCard
          label="Já utilizado"
          value={brlFromCents(used)}
          hint={limit ? pct((used / limit) * 100) : "0%"}
        />
        <StatCard
          label="Categorias estouradas"
          value={String(exceeded.length)}
          icon={AlertTriangle}
          tone="warning"
          hint={
            exceeded
              .map((budget) => categoryById.get(budget.category_id ?? "")?.name)
              .filter(Boolean)
              .join(", ") || "Nenhuma"
          }
        />
      </div>

      {budgets.isLoading || categories.isLoading || transactions.isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Carregando orçamentos...</p>
      ) : budgets.isError || categories.isError || transactions.isError ? (
        <EmptyState
          icon={PiggyBank}
          title="Não foi possível carregar os orçamentos"
          description="Verifique sua conexão e tente novamente."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="Nenhum orçamento neste mês"
          description="Defina um limite para acompanhar seus gastos por categoria."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((budget) => {
            const value = spent(budget.category_id);
            const progress = budget.limit_cents ? (value / budget.limit_cents) * 100 : 0;
            const over = progress > 100;
            return (
              <Card key={budget.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <p className="truncate font-medium">
                      {categoryById.get(budget.category_id ?? "")?.name || "Categoria removida"}
                    </p>
                    <span
                      className={`num text-sm ${over ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {pct(progress)}
                    </span>
                  </div>
                  <Progress value={Math.min(progress, 100)} />
                  <p className="num text-sm text-muted-foreground">
                    {brlFromCents(value)} de {brlFromCents(budget.limit_cents)} ·{" "}
                    {over ? (
                      <span className="text-destructive">
                        excedeu {brlFromCents(value - budget.limit_cents)}
                      </span>
                    ) : (
                      <span>restam {brlFromCents(budget.limit_cents - value)}</span>
                    )}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

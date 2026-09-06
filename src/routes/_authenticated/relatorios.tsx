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

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";
import { useRows } from "@/lib/db";
import { expensesByCategory, monthlyFlow } from "@/lib/finance";
import { brlFromCents, fromCents } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Meu Financeiro" }] }),
  component: RelatoriosPage,
});

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

function RelatoriosPage() {
  const transactions = useRows<Tables<"transactions">>("transactions", {
    orderBy: "occurred_on",
    ascending: false,
  });
  const categories = useRows<Tables<"categories">>("categories");
  const accounts = useRows<Tables<"accounts">>("accounts");
  const cards = useRows<Tables<"credit_cards">>("credit_cards");
  const rows = transactions.data ?? [];
  const flow = monthlyFlow(rows);
  const periodKeys = new Set(flow.map((item) => item.key));
  const periodRows = rows.filter(
    (tx) => periodKeys.has(tx.occurred_on.slice(0, 7)) && tx.status !== "cancelado",
  );
  const income = periodRows
    .filter((tx) => tx.type === "receita")
    .reduce((sum, tx) => sum + tx.amount_cents, 0);
  const expenses = periodRows
    .filter((tx) => tx.type === "despesa")
    .reduce((sum, tx) => sum + tx.amount_cents, 0);
  const byCategory = expensesByCategory(periodRows, categories.data ?? []);

  function exportCsv() {
    const categoryNames = new Map((categories.data ?? []).map((item) => [item.id, item.name]));
    const accountNames = new Map((accounts.data ?? []).map((item) => [item.id, item.name]));
    const cardNames = new Map((cards.data ?? []).map((item) => [item.id, item.name]));
    const header = [
      "Data",
      "Descrição",
      "Tipo",
      "Status",
      "Valor (BRL)",
      "Categoria",
      "Conta ou cartão",
      "Observações",
    ];
    const lines = rows.map((tx) => [
      tx.occurred_on,
      tx.description,
      tx.type,
      tx.status,
      fromCents(tx.amount_cents).toFixed(2).replace(".", ","),
      categoryNames.get(tx.category_id ?? "") ?? "",
      accountNames.get(tx.account_id ?? "") ?? cardNames.get(tx.credit_card_id ?? "") ?? "",
      tx.notes ?? "",
    ]);
    const csv = `\uFEFF${[header, ...lines].map((line) => line.map(csvCell).join(";")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `meu-financeiro-${new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" })}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const loading =
    transactions.isLoading || categories.isLoading || accounts.isLoading || cards.isLoading;
  const failed = transactions.isError || categories.isError || accounts.isError || cards.isError;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Últimos seis meses, com base nos seus lançamentos"
        action={
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={exportCsv}
            disabled={rows.length === 0}
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Receitas no período"
          value={brlFromCents(income)}
          tone="success"
          icon={BarChart3}
        />
        <StatCard label="Despesas no período" value={brlFromCents(expenses)} tone="destructive" />
        <StatCard label="Resultado" value={brlFromCents(income - expenses)} tone="info" />
      </div>
      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Preparando relatórios...</p>
      ) : failed ? (
        <EmptyState
          icon={BarChart3}
          title="Não foi possível gerar os relatórios"
          description="Verifique sua conexão e tente novamente."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Ainda não há dados para analisar"
          description="Registre receitas e despesas para formar seus relatórios."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Receitas x despesas</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flow}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis
                    tickFormatter={(value) => `${Math.round(value / 100000)}k`}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    fontSize={12}
                  />
                  <Tooltip formatter={(value: number) => brlFromCents(value)} />
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
              {byCategory.length === 0 ? (
                <p className="pt-20 text-center text-sm text-muted-foreground">
                  Sem despesas no período.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="valor"
                      nameKey="categoria"
                      innerRadius={50}
                      outerRadius={90}
                    >
                      {byCategory.map((item) => (
                        <Cell key={item.categoria} fill={item.cor} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => brlFromCents(value)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

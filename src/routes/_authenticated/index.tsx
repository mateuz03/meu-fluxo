import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, CreditCard, ShieldCheck, Wallet } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Tables } from "@/integrations/supabase/types";
import { useProfile, useRows } from "@/lib/db";
import {
  accountBalanceCents,
  currentMonthKey,
  expensesByCategory,
  indexAccountTransferPairs,
  monthlyFlow,
} from "@/lib/finance";
import { brlFromCents, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [{ title: "Visão geral — Meu Financeiro" }] }),
  component: Dashboard,
});

function Dashboard() {
  const profile = useProfile();
  const accounts = useRows<Tables<"accounts">>("accounts");
  const transactions = useRows<Tables<"transactions">>("transactions", {
    orderBy: "occurred_on",
    ascending: false,
  });
  const cards = useRows<Tables<"credit_cards">>("credit_cards");
  const categories = useRows<Tables<"categories">>("categories");
  const goals = useRows<Tables<"financial_goals">>("financial_goals");
  const subscriptions = useRows<Tables<"subscriptions">>("subscriptions", {
    orderBy: "day_of_month",
  });
  const budgets = useRows<Tables<"budgets">>("budgets");
  const month = currentMonthKey();
  const txs = transactions.data ?? [];
  const validMonth = txs.filter(
    (tx) => tx.status !== "cancelado" && tx.occurred_on.startsWith(month),
  );
  const income = validMonth
    .filter((tx) => tx.type === "receita")
    .reduce((sum, tx) => sum + tx.amount_cents, 0);
  const expenses = validMonth
    .filter((tx) => tx.type === "despesa")
    .reduce((sum, tx) => sum + tx.amount_cents, 0);
  const balance = (accounts.data ?? [])
    .filter((account) => !account.archived)
    .reduce((sum, account) => sum + accountBalanceCents(account, txs), 0);
  const invoices = validMonth
    .filter((tx) => tx.type === "despesa" && tx.credit_card_id)
    .reduce((sum, tx) => sum + tx.amount_cents, 0);
  const flow = monthlyFlow(txs);
  const byCategory = expensesByCategory(txs, categories.data ?? [], month);
  const accountNames = new Map((accounts.data ?? []).map((account) => [account.id, account.name]));
  const categoryNames = new Map(
    (categories.data ?? []).map((category) => [category.id, category.name]),
  );
  const cardNames = new Map((cards.data ?? []).map((card) => [card.id, card.name]));
  const transferPairs = indexAccountTransferPairs(txs);
  const recentTransactions = txs
    .filter(
      (tx) =>
        tx.type !== "transferencia" ||
        !tx.transfer_group_id ||
        !transferPairs.get(tx.transfer_group_id)?.source ||
        transferPairs.get(tx.transfer_group_id)?.source?.id === tx.id,
    )
    .slice(0, 6);
  const topGoal = [...(goals.data ?? [])].sort(
    (a, b) =>
      (b.target_cents ? b.current_cents / b.target_cents : 0) -
      (a.target_cents ? a.current_cents / a.target_cents : 0),
  )[0];
  const currentBudgets = (budgets.data ?? []).filter((budget) => budget.month.startsWith(month));
  const loading = [accounts, transactions, cards, categories, goals, subscriptions, budgets].some(
    (query) => query.isLoading,
  );
  const failed = [accounts, transactions, cards, categories, goals, subscriptions, budgets].some(
    (query) => query.isError,
  );

  if (loading)
    return (
      <p className="py-20 text-center text-sm text-muted-foreground">Montando sua visão geral...</p>
    );
  if (failed)
    return (
      <EmptyState
        icon={Wallet}
        title="Não foi possível montar a visão geral"
        description="Verifique sua conexão e recarregue a página."
      />
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          profile.data?.full_name ? `Olá, ${profile.data.full_name.split(" ")[0]}` : "Visão geral"
        }
        description={new Date(`${month}-02T12:00:00`).toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to="/relatorios">Ver relatórios</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Saldo atual"
          value={brlFromCents(balance)}
          icon={Wallet}
          tone="info"
          hint="Contas e lançamentos pagos"
        />
        <StatCard
          label="Receitas do mês"
          value={brlFromCents(income)}
          icon={ArrowUpRight}
          tone="success"
        />
        <StatCard
          label="Despesas do mês"
          value={brlFromCents(expenses)}
          icon={ArrowDownRight}
          tone="destructive"
          {...(income ? { hint: `${Math.round((expenses / income) * 100)}% das receitas` } : {})}
        />
        <StatCard
          label="Faturas do mês"
          value={brlFromCents(invoices)}
          icon={CreditCard}
          tone="warning"
          hint={`${(cards.data ?? []).filter((card) => !card.archived).length} cartões ativos`}
        />
      </div>

      {txs.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Sua visão geral começa aqui"
          description="Cadastre uma conta e faça o primeiro lançamento para ver seus indicadores."
          action={
            <Button asChild size="sm">
              <Link to="/transacoes">Registrar lançamento</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Fluxo de caixa</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={flow} barGap={4}>
                    <CartesianGrid vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis
                      tickFormatter={(value) => `${Math.round(value / 100000)}k`}
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      width={36}
                    />
                    <Tooltip formatter={(value: number) => brlFromCents(value)} />
                    <Bar dataKey="receitas" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="despesas" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Despesas por categoria</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {byCategory.length === 0 ? (
                  <p className="pt-16 text-center text-sm text-muted-foreground">
                    Sem despesas neste mês.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byCategory}
                        dataKey="valor"
                        nameKey="categoria"
                        innerRadius={52}
                        outerRadius={82}
                        paddingAngle={3}
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
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Últimos lançamentos</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/transacoes">Ver todos</Link>
                </Button>
              </CardHeader>
              <CardContent className="divide-y divide-border p-0">
                {recentTransactions.map((tx) => {
                  const destination = tx.transfer_group_id
                    ? transferPairs.get(tx.transfer_group_id)?.destination
                    : undefined;
                  return (
                    <div
                      key={tx.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{tx.description}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {tx.type === "transferencia"
                            ? (accountNames.get(tx.account_id ?? "") || "Conta removida") +
                              " → " +
                              (accountNames.get(destination?.account_id ?? "") || "Conta removida")
                            : (categoryNames.get(tx.category_id ?? "") || "Sem categoria") +
                              " · " +
                              (accountNames.get(tx.account_id ?? "") ||
                                cardNames.get(tx.credit_card_id ?? "") ||
                                "Sem conta")}{" "}
                          · {shortDate(tx.occurred_on)}
                        </p>
                      </div>
                      <span
                        className={`num shrink-0 text-sm font-semibold ${
                          tx.type === "receita"
                            ? "text-success"
                            : tx.type === "despesa"
                              ? "text-destructive"
                              : "text-muted-foreground"
                        }`}
                      >
                        {tx.type === "receita" ? "+" : tx.type === "despesa" ? "−" : ""}{" "}
                        {brlFromCents(Math.abs(tx.amount_cents))}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{topGoal?.name || "Meta principal"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {topGoal ? (
                    <>
                      <Progress
                        value={
                          topGoal.target_cents
                            ? Math.min((topGoal.current_cents / topGoal.target_cents) * 100, 100)
                            : 0
                        }
                      />
                      <p className="num text-sm text-muted-foreground">
                        {brlFromCents(topGoal.current_cents)} de{" "}
                        {brlFromCents(topGoal.target_cents)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Crie uma meta para acompanhar aqui.
                    </p>
                  )}
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" /> Valores informados por você
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contas recorrentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(subscriptions.data ?? [])
                    .filter((item) => item.active)
                    .slice(0, 4)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">dia {item.day_of_month}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="num text-sm font-medium">
                            {brlFromCents(item.amount_cents)}
                          </span>
                          <Badge variant="outline">ativa</Badge>
                        </div>
                      </div>
                    ))}
                  {(subscriptions.data ?? []).filter((item) => item.active).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma conta recorrente.</p>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Orçamentos do mês</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/orcamentos">Gerenciar</Link>
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {currentBudgets.slice(0, 4).map((budget) => {
                const category = (categories.data ?? []).find(
                  (item) => item.id === budget.category_id,
                );
                const spent = validMonth
                  .filter((tx) => tx.type === "despesa" && tx.category_id === budget.category_id)
                  .reduce((sum, tx) => sum + tx.amount_cents, 0);
                const progress = budget.limit_cents ? (spent / budget.limit_cents) * 100 : 0;
                return (
                  <div key={budget.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{category?.name || "Categoria removida"}</span>
                      <span
                        className={`num ${progress > 100 ? "text-destructive" : "text-muted-foreground"}`}
                      >
                        {brlFromCents(spent)} / {brlFromCents(budget.limit_cents)}
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} />
                  </div>
                );
              })}
              {currentBudgets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum orçamento definido para este mês.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

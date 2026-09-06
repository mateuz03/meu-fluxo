import type { Tables } from "@/integrations/supabase/types";

export const saoPauloToday = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

export const currentMonthKey = () => saoPauloToday().slice(0, 7);

export function accountBalanceCents(
  account: Tables<"accounts">,
  transactions: Tables<"transactions">[],
) {
  return (
    account.opening_balance_cents +
    transactions
      .filter((tx) => tx.account_id === account.id && tx.status !== "cancelado")
      .reduce((sum, tx) => {
        if (tx.type === "receita") return sum + tx.amount_cents;
        if (tx.type === "despesa") return sum - tx.amount_cents;
        return sum;
      }, 0)
  );
}

export function monthlyFlow(transactions: Tables<"transactions">[], count = 6) {
  const formatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });
  const now = new Date(`${saoPauloToday()}T12:00:00`);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const rows = transactions.filter(
      (tx) => tx.occurred_on.startsWith(key) && tx.status !== "cancelado",
    );
    return {
      key,
      mes: formatter.format(date).replace(".", ""),
      receitas: rows
        .filter((tx) => tx.type === "receita")
        .reduce((sum, tx) => sum + tx.amount_cents, 0),
      despesas: rows
        .filter((tx) => tx.type === "despesa")
        .reduce((sum, tx) => sum + tx.amount_cents, 0),
    };
  });
}

export function expensesByCategory(
  transactions: Tables<"transactions">[],
  categories: Tables<"categories">[],
  month?: string,
) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const grouped = new Map<string, { categoria: string; valor: number; cor: string }>();
  transactions
    .filter(
      (tx) =>
        tx.type === "despesa" &&
        tx.status !== "cancelado" &&
        (!month || tx.occurred_on.startsWith(month)),
    )
    .forEach((tx) => {
      const category = tx.category_id ? categoryById.get(tx.category_id) : undefined;
      const key = category?.id ?? "uncategorized";
      const current = grouped.get(key) ?? {
        categoria: category?.name ?? "Sem categoria",
        valor: 0,
        cor: category?.color ?? "#64748b",
      };
      current.valor += tx.amount_cents;
      grouped.set(key, current);
    });
  return [...grouped.values()].sort((a, b) => b.valor - a.valor);
}

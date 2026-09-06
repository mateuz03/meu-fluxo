import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RecordDialog, type Field } from "@/components/record-dialog";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";
import { useRows } from "@/lib/db";
import { brlFromCents } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/contas")({
  head: () => ({ meta: [{ title: "Contas bancárias — Meu Financeiro" }] }),
  component: Contas,
});

const accountFields: Field[] = [
  {
    name: "name",
    label: "Nome da conta",
    type: "text",
    required: true,
    placeholder: "Ex.: Conta principal",
  },
  { name: "institution", label: "Instituição", type: "text", placeholder: "Ex.: Nubank" },
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    default: "corrente",
    options: [
      { value: "corrente", label: "Conta-corrente" },
      { value: "poupanca", label: "Poupança" },
      { value: "carteira", label: "Dinheiro ou carteira" },
      { value: "investimento", label: "Conta de investimentos" },
      { value: "outro", label: "Outra" },
    ],
  },
  { name: "opening_balance_cents", label: "Saldo inicial", type: "money", default: "0" },
];

function Contas() {
  const accounts = useRows<Tables<"accounts">>("accounts", { orderBy: "name" });
  const transactions = useRows<Tables<"transactions">>("transactions");
  const rows = accounts.data ?? [];

  const balance = (account: Tables<"accounts">) =>
    account.opening_balance_cents +
    (transactions.data ?? [])
      .filter((tx) => tx.account_id === account.id && tx.status !== "cancelado")
      .reduce((sum, tx) => {
        if (tx.type === "receita") return sum + tx.amount_cents;
        if (tx.type === "despesa") return sum - tx.amount_cents;
        return sum;
      }, 0);
  const active = rows.filter((account) => !account.archived);
  const total = active.reduce((sum, account) => sum + balance(account), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas"
        description="Saldos calculados a partir dos seus lançamentos"
        action={
          <RecordDialog
            table="accounts"
            title="Nova conta"
            fields={accountFields}
            label="Nova conta"
          />
        }
      />
      <StatCard
        label="Saldo consolidado"
        value={brlFromCents(total)}
        icon={Wallet}
        tone="info"
        hint={`${active.length} contas ativas`}
      />

      {accounts.isLoading || transactions.isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Carregando suas contas...</p>
      ) : accounts.isError || transactions.isError ? (
        <EmptyState
          icon={Wallet}
          title="Não foi possível carregar as contas"
          description="Verifique sua conexão e tente novamente."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Nenhuma conta cadastrada"
          description="Cadastre sua primeira conta para acompanhar o saldo real."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((account) => (
            <Card key={account.id} className={account.archived ? "opacity-60" : undefined}>
              <CardContent className="flex items-center gap-3 p-5">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white"
                  style={{ backgroundColor: account.color }}
                >
                  {account.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{account.name}</p>
                  <p className="truncate text-xs capitalize text-muted-foreground">
                    {account.institution || account.type}
                  </p>
                  <p className="num mt-1 text-lg font-bold">{brlFromCents(balance(account))}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

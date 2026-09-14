import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  ArchiveRestore,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Pencil,
  Wallet,
} from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RecordDialog, type Field } from "@/components/record-dialog";
import { StatCard } from "@/components/stat-card";
import { TransferDialog } from "@/components/transfer-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";
import { useRows, useUpdateRow } from "@/lib/db";
import { accountBalanceCents, indexAccountTransferPairs } from "@/lib/finance";
import { brlFromCents, shortDate, toCents } from "@/lib/format";

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

const accountTypes: Record<string, string> = {
  corrente: "Conta-corrente",
  poupanca: "Poupança",
  carteira: "Dinheiro ou carteira",
  investimento: "Conta de investimentos",
  outro: "Outra",
};

const txIcon = {
  receita: ArrowDownLeft,
  despesa: ArrowUpRight,
  transferencia: ArrowLeftRight,
} as const;

function AccountDialog({
  account,
  accounts,
  transactions,
  onClose,
}: {
  account: Tables<"accounts">;
  accounts: Tables<"accounts">[];
  transactions: Tables<"transactions">[];
  onClose: () => void;
}) {
  const update = useUpdateRow("accounts");
  const [name, setName] = useState(account.name);
  const [institution, setInstitution] = useState(account.institution ?? "");
  const [type, setType] = useState(account.type);
  const [opening, setOpening] = useState((account.opening_balance_cents / 100).toFixed(2));

  const balance = accountBalanceCents(account, transactions);
  const statement = transactions
    .filter((tx) => tx.account_id === account.id)
    .sort((a, b) => b.occurred_on.localeCompare(a.occurred_on));
  const accountNames = new Map(accounts.map((item) => [item.id, item.name]));
  const transferPairs = indexAccountTransferPairs(transactions);

  function save(e: React.FormEvent) {
    e.preventDefault();
    update.mutate(
      {
        id: account.id,
        values: {
          name,
          institution: institution || null,
          type,
          opening_balance_cents: toCents(opening),
        },
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{account.name}</DialogTitle>
        </DialogHeader>

        <div className="rounded-2xl bg-muted/60 p-4">
          <p className="text-xs text-muted-foreground">Saldo atual</p>
          <p className="num mt-1 text-2xl font-bold">{brlFromCents(balance)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Saldo inicial + movimentações. Para corrigir o saldo, ajuste o saldo inicial abaixo.
          </p>
        </div>

        <form onSubmit={save} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="acc-name">Nome da conta</Label>
            <Input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="acc-inst">Instituição</Label>
              <Input
                id="acc-inst"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(accountTypes).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="acc-opening">Saldo inicial (R$)</Label>
            <Input
              id="acc-opening"
              type="number"
              step="0.01"
              inputMode="decimal"
              value={opening}
              onChange={(e) => setOpening(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full gap-1.5" disabled={update.isPending}>
            <Pencil className="h-4 w-4" />
            {update.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full gap-1.5"
            disabled={update.isPending}
            onClick={() =>
              update.mutate(
                { id: account.id, values: { archived: !account.archived } },
                { onSuccess: onClose },
              )
            }
          >
            {account.archived ? (
              <ArchiveRestore className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            {account.archived ? "Reativar conta" : "Arquivar conta"}
          </Button>
        </form>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Extrato</h3>
          {statement.length === 0 ? (
            <p className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
              Nenhuma movimentação nesta conta ainda.
            </p>
          ) : (
            <ul className="divide-y rounded-xl border">
              {statement.map((tx) => {
                const Icon = txIcon[tx.type];
                const pair = tx.transfer_group_id
                  ? transferPairs.get(tx.transfer_group_id)
                  : undefined;
                const counterpart = tx.amount_cents < 0 ? pair?.destination : pair?.source;
                return (
                  <li
                    key={tx.id}
                    className={`flex items-center gap-3 px-3 py-2.5 ${
                      tx.status === "cancelado" ? "opacity-55" : ""
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                        tx.type === "receita"
                          ? "bg-success/15 text-success"
                          : tx.type === "despesa"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {shortDate(tx.occurred_on)}
                        {tx.type === "transferencia" && counterpart?.account_id
                          ? ` · ${tx.amount_cents < 0 ? "para" : "de"} ${
                              accountNames.get(counterpart.account_id) || "Conta removida"
                            }`
                          : ""}
                        {tx.status === "pendente" ? " · pendente" : ""}
                        {tx.status === "cancelado" ? " · cancelada" : ""}
                      </p>
                    </div>
                    <span
                      className={`num text-sm font-semibold ${
                        tx.type === "receita"
                          ? "text-success"
                          : tx.type === "despesa"
                            ? "text-destructive"
                            : "text-muted-foreground"
                      }`}
                    >
                      {tx.type === "receita" || (tx.type === "transferencia" && tx.amount_cents > 0)
                        ? "+"
                        : "−"}{" "}
                      {brlFromCents(Math.abs(tx.amount_cents))}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Contas() {
  const accounts = useRows<Tables<"accounts">>("accounts", { orderBy: "name" });
  const transactions = useRows<Tables<"transactions">>("transactions");
  const [selected, setSelected] = useState<Tables<"accounts"> | null>(null);
  const rows = accounts.data ?? [];
  const txs = transactions.data ?? [];

  const balance = (account: Tables<"accounts">) => accountBalanceCents(account, txs);
  const active = rows.filter((account) => !account.archived);
  const total = active.reduce((sum, account) => sum + balance(account), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas"
        description="Toque em uma conta para editar e ver o extrato"
        action={
          <div className="flex items-center gap-2">
            <TransferDialog accounts={rows} />
            <RecordDialog
              table="accounts"
              title="Nova conta"
              fields={accountFields}
              label="Nova conta"
            />
          </div>
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
            <button
              key={account.id}
              type="button"
              onClick={() => setSelected(account)}
              className="text-left"
            >
              <Card
                className={`transition-colors hover:border-primary/50 ${
                  account.archived ? "opacity-60" : ""
                }`}
              >
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
                      {account.institution || accountTypes[account.type] || account.type}
                    </p>
                    <p className="num mt-1 text-lg font-bold">{brlFromCents(balance(account))}</p>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <AccountDialog
          account={rows.find((a) => a.id === selected.id) ?? selected}
          accounts={rows}
          transactions={txs}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

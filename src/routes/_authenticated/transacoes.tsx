import { createFileRoute } from "@tanstack/react-router";
import { Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RecordActions } from "@/components/record-actions";
import { RecordDialog, type Field } from "@/components/record-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tables } from "@/integrations/supabase/types";
import { useRows } from "@/lib/db";
import { brlFromCents, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/transacoes")({
  head: () => ({ meta: [{ title: "Transações — Meu Financeiro" }] }),
  component: Transacoes,
});

function Transacoes() {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [month, setMonth] = useState("");
  const transactions = useRows<Tables<"transactions">>("transactions", {
    orderBy: "occurred_on",
    ascending: false,
  });
  const accounts = useRows<Tables<"accounts">>("accounts", { orderBy: "name" });
  const categories = useRows<Tables<"categories">>("categories", { orderBy: "name" });
  const cards = useRows<Tables<"credit_cards">>("credit_cards", { orderBy: "name" });

  const accountNames = useMemo(
    () => new Map((accounts.data ?? []).map((account) => [account.id, account.name])),
    [accounts.data],
  );
  const categoryNames = useMemo(
    () => new Map((categories.data ?? []).map((category) => [category.id, category.name])),
    [categories.data],
  );
  const cardNames = useMemo(
    () => new Map((cards.data ?? []).map((card) => [card.id, card.name])),
    [cards.data],
  );
  const fields: Field[] = [
    {
      name: "description",
      label: "Descrição",
      type: "text",
      required: true,
      placeholder: "Ex.: Supermercado",
    },
    {
      name: "type",
      label: "Tipo",
      type: "select",
      required: true,
      default: "despesa",
      options: [
        { value: "receita", label: "Receita" },
        { value: "despesa", label: "Despesa" },
      ],
    },
    { name: "amount_cents", label: "Valor", type: "money", required: true, min: 0 },
    {
      name: "occurred_on",
      label: "Data",
      type: "date",
      required: true,
      default: new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }),
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      default: "pago",
      options: [
        { value: "pago", label: "Pago" },
        { value: "pendente", label: "Pendente" },
        { value: "cancelado", label: "Cancelado" },
      ],
    },
    {
      name: "account_id",
      label: "Conta",
      type: "select",
      allowEmpty: true,
      emptyLabel: "Sem conta",
      options: (accounts.data ?? [])
        .filter((account) => !account.archived)
        .map((account) => ({ value: account.id, label: account.name })),
    },
    {
      name: "category_id",
      label: "Categoria",
      type: "select",
      allowEmpty: true,
      emptyLabel: "Sem categoria",
      options: (categories.data ?? [])
        .filter((category) => !category.archived)
        .map((category) => ({ value: category.id, label: category.name })),
    },
    {
      name: "credit_card_id",
      label: "Cartão (se aplicável)",
      type: "select",
      allowEmpty: true,
      emptyLabel: "Sem cartão",
      options: (cards.data ?? [])
        .filter((card) => !card.archived)
        .map((card) => ({ value: card.id, label: card.name })),
    },
    { name: "notes", label: "Observações", type: "text" },
  ];

  const lista = useMemo(
    () =>
      (transactions.data ?? []).filter((tx) => {
        const searchable =
          `${tx.description} ${categoryNames.get(tx.category_id ?? "") ?? ""} ${accountNames.get(tx.account_id ?? "") ?? ""} ${cardNames.get(tx.credit_card_id ?? "") ?? ""}`.toLowerCase();
        return (
          (tipo === "todos" || tx.type === tipo) &&
          (status === "todos" || tx.status === status) &&
          (!month || tx.occurred_on.startsWith(month)) &&
          searchable.includes(busca.toLowerCase())
        );
      }),
    [transactions.data, tipo, status, month, busca, categoryNames, accountNames, cardNames],
  );
  const valid = lista.filter((tx) => tx.status !== "cancelado");
  const receitas = valid
    .filter((tx) => tx.type === "receita")
    .reduce((sum, tx) => sum + tx.amount_cents, 0);
  const despesas = valid
    .filter((tx) => tx.type === "despesa")
    .reduce((sum, tx) => sum + tx.amount_cents, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transações"
        description="Receitas e despesas registradas por você"
        action={
          <RecordDialog
            table="transactions"
            title="Novo lançamento"
            fields={fields}
            label="Novo lançamento"
          />
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por descrição, categoria, conta ou cartão"
            className="pl-9"
          />
        </div>
        <Tabs value={tipo} onValueChange={setTipo}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="receita">Receitas</TabsTrigger>
            <TabsTrigger value="despesa">Despesas</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Filter className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[130px]" aria-label="Filtrar por status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            aria-label="Filtrar por mês"
            className="w-[145px]"
          />
          {month ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setMonth("")}>
              Limpar mês
            </Button>
          ) : null}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Entradas</p>
            <p className="num text-lg font-bold text-success">{brlFromCents(receitas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Saídas</p>
            <p className="num text-lg font-bold text-destructive">{brlFromCents(despesas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Resultado</p>
            <p className="num text-lg font-bold">{brlFromCents(receitas - despesas)}</p>
          </CardContent>
        </Card>
      </div>
      {transactions.isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Carregando lançamentos...</p>
      ) : transactions.isError ? (
        <EmptyState
          icon={Search}
          title="Não foi possível carregar os lançamentos"
          description="Verifique sua conexão e tente novamente."
        />
      ) : lista.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum lançamento encontrado"
          description="Ajuste os filtros ou registre uma receita ou despesa."
        />
      ) : (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {lista.map((tx) => (
              <div
                key={tx.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 sm:px-5"
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-medium">{tx.description}</p>
                    {tx.installment_label ? (
                      <Badge variant="outline">{tx.installment_label}</Badge>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {shortDate(tx.occurred_on)} ·{" "}
                    {categoryNames.get(tx.category_id ?? "") || "Sem categoria"} ·{" "}
                    {accountNames.get(tx.account_id ?? "") ||
                      cardNames.get(tx.credit_card_id ?? "") ||
                      "Sem conta"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`num text-sm font-semibold ${tx.type === "receita" ? "text-success" : tx.type === "despesa" ? "text-destructive" : ""}`}
                    >
                      {tx.type === "receita" ? "+" : tx.type === "despesa" ? "−" : ""}{" "}
                      {brlFromCents(tx.amount_cents)}
                    </span>
                    <Badge variant={tx.status === "pago" ? "secondary" : "outline"}>
                      {tx.status}
                    </Badge>
                  </div>
                  <RecordActions
                    table="transactions"
                    id={tx.id}
                    editTitle={`Editar ${tx.description}`}
                    fields={fields}
                    values={{ ...tx }}
                    deleteDescription="O lançamento será removido dos saldos, relatórios e orçamentos. Esta ação não pode ser desfeita."
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RecordActions } from "@/components/record-actions";
import { RecordDialog, type Field } from "@/components/record-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Tables } from "@/integrations/supabase/types";
import { useRows } from "@/lib/db";
import { saoPauloToday } from "@/lib/finance";
import { brlFromCents } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/cartoes")({
  head: () => ({ meta: [{ title: "Cartões de crédito — Meu Financeiro" }] }),
  component: Cartoes,
});

function Cartoes() {
  const cards = useRows<Tables<"credit_cards">>("credit_cards", { orderBy: "name" });
  const accounts = useRows<Tables<"accounts">>("accounts", { orderBy: "name" });
  const transactions = useRows<Tables<"transactions">>("transactions");
  const installments = useRows<Tables<"card_installments">>("card_installments", {
    orderBy: "first_charge_on",
  });
  const cardNames = new Map((cards.data ?? []).map((card) => [card.id, card.name]));
  const currentMonth = new Date()
    .toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" })
    .slice(0, 7);
  const invoice = (cardId: string) =>
    (transactions.data ?? [])
      .filter(
        (tx) =>
          tx.credit_card_id === cardId &&
          tx.type === "despesa" &&
          tx.status !== "cancelado" &&
          tx.occurred_on.startsWith(currentMonth),
      )
      .reduce((sum, tx) => sum + tx.amount_cents, 0);

  const fields: Field[] = [
    {
      name: "name",
      label: "Nome do cartão",
      type: "text",
      required: true,
      placeholder: "Ex.: Cartão principal",
    },
    {
      name: "brand",
      label: "Bandeira",
      type: "select",
      options: ["Visa", "Mastercard", "Elo", "American Express", "Outra"].map((brand) => ({
        value: brand,
        label: brand,
      })),
    },
    { name: "limit_cents", label: "Limite", type: "money", required: true, min: 0 },
    {
      name: "closing_day",
      label: "Dia de fechamento",
      type: "number",
      required: true,
      default: "1",
      min: 1,
      max: 31,
    },
    {
      name: "due_day",
      label: "Dia de vencimento",
      type: "number",
      required: true,
      default: "10",
      min: 1,
      max: 31,
    },
    {
      name: "payment_account_id",
      label: "Conta para pagamento",
      type: "select",
      allowEmpty: true,
      emptyLabel: "Sem conta definida",
      options: (accounts.data ?? [])
        .filter((account) => !account.archived)
        .map((account) => ({ value: account.id, label: account.name })),
    },
  ];
  const installmentFields: Field[] = [
    {
      name: "credit_card_id",
      label: "Cartão",
      type: "select",
      required: true,
      options: (cards.data ?? [])
        .filter((card) => !card.archived)
        .map((card) => ({ value: card.id, label: card.name })),
    },
    { name: "description", label: "Descrição", type: "text", required: true },
    { name: "total_cents", label: "Valor total", type: "money", required: true, min: 0 },
    {
      name: "installments_total",
      label: "Total de parcelas",
      type: "number",
      required: true,
      min: 1,
    },
    {
      name: "installments_paid",
      label: "Parcelas já pagas",
      type: "number",
      default: "0",
      min: 0,
    },
    {
      name: "first_charge_on",
      label: "Data da primeira parcela",
      type: "date",
      required: true,
      default: saoPauloToday(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cartões"
        description="Faturas do mês, limites e compras parceladas"
        action={
          <RecordDialog
            table="credit_cards"
            title="Novo cartão"
            fields={fields}
            label="Novo cartão"
          />
        }
      />
      {cards.isLoading || transactions.isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Carregando cartões...</p>
      ) : cards.isError || transactions.isError ? (
        <EmptyState
          icon={CreditCard}
          title="Não foi possível carregar os cartões"
          description="Verifique sua conexão e tente novamente."
        />
      ) : (cards.data ?? []).length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Nenhum cartão cadastrado"
          description="Cadastre um cartão e associe suas compras a ele."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(cards.data ?? []).map((card) => {
            const total = invoice(card.id);
            const usage = card.limit_cents > 0 ? (total / card.limit_cents) * 100 : 0;
            return (
              <Card
                key={card.id}
                className={`overflow-hidden ${card.archived ? "opacity-60" : ""}`}
              >
                <CardContent className="space-y-4 p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{card.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {card.brand || "Bandeira não informada"}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="mr-1 h-5 w-5 shrink-0" style={{ color: card.color }} />
                      <RecordActions
                        table="credit_cards"
                        id={card.id}
                        editTitle={`Editar ${card.name}`}
                        fields={fields}
                        values={{ ...card }}
                        archive={{ archived: card.archived, noun: "cartão" }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Fatura do mês</p>
                    <p className="num text-2xl font-bold">{brlFromCents(total)}</p>
                  </div>
                  <Progress value={Math.min(usage, 100)} />
                  <p className="num text-xs text-muted-foreground">
                    Limite disponível {brlFromCents(Math.max(card.limit_cents - total, 0))} de{" "}
                    {brlFromCents(card.limit_cents)}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">Fecha dia {card.closing_day}</Badge>
                    <Badge variant="secondary">Vence dia {card.due_day}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Compras parceladas</CardTitle>
          <RecordDialog
            table="card_installments"
            title="Nova compra parcelada"
            fields={installmentFields}
            label="Nova compra"
          />
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {(installments.data ?? []).length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">
              Nenhuma compra parcelada cadastrada.
            </p>
          ) : (
            (installments.data ?? []).map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.description}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {cardNames.get(item.credit_card_id ?? "") || "Cartão removido"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Badge variant="outline">
                    {item.installments_paid}/{item.installments_total}
                  </Badge>
                  <span className="num text-sm font-semibold">
                    {brlFromCents(
                      Math.round(item.total_cents / Math.max(item.installments_total, 1)),
                    )}
                  </span>
                  <RecordActions
                    table="card_installments"
                    id={item.id}
                    editTitle={`Editar ${item.description}`}
                    fields={installmentFields}
                    values={{ ...item }}
                    deleteDescription="O controle desta compra parcelada será excluído. Os lançamentos já registrados não serão removidos."
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

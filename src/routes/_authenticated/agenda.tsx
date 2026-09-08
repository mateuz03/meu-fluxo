import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, Pause, Play, RotateCcw } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RecordActions } from "@/components/record-actions";
import { RecordDialog, type Field } from "@/components/record-dialog";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";
import { useRows, useUpdateRow } from "@/lib/db";
import { saoPauloToday } from "@/lib/finance";
import { brlFromCents, longDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({ meta: [{ title: "Agenda financeira — Meu Financeiro" }] }),
  component: AgendaPage,
});

function AgendaPage() {
  const reminders = useRows<Tables<"reminders">>("reminders", { orderBy: "due_on" });
  const subscriptions = useRows<Tables<"subscriptions">>("subscriptions", {
    orderBy: "day_of_month",
  });
  const accounts = useRows<Tables<"accounts">>("accounts", { orderBy: "name" });
  const categories = useRows<Tables<"categories">>("categories", { orderBy: "name" });
  const updateReminder = useUpdateRow("reminders");
  const updateSubscription = useUpdateRow("subscriptions");
  const rows = reminders.data ?? [];
  const toPay = rows
    .filter((item) => !item.done && item.kind === "despesa")
    .reduce((sum, item) => sum + item.amount_cents, 0);
  const toReceive = rows
    .filter((item) => !item.done && item.kind === "receita")
    .reduce((sum, item) => sum + item.amount_cents, 0);
  const categoryNames = new Map(
    (categories.data ?? []).map((category) => [category.id, category.name]),
  );
  const reminderFields: Field[] = [
    { name: "title", label: "Título", type: "text", required: true },
    {
      name: "kind",
      label: "Tipo",
      type: "select",
      required: true,
      default: "despesa",
      options: [
        { value: "despesa", label: "Pagamento" },
        { value: "receita", label: "Recebimento" },
      ],
    },
    { name: "amount_cents", label: "Valor", type: "money", default: "0", min: 0 },
    { name: "due_on", label: "Data", type: "date", required: true, default: saoPauloToday() },
  ];
  const subscriptionFields: Field[] = [
    { name: "name", label: "Nome", type: "text", required: true, placeholder: "Ex.: Internet" },
    { name: "amount_cents", label: "Valor mensal", type: "money", required: true, min: 0 },
    {
      name: "day_of_month",
      label: "Dia do vencimento",
      type: "number",
      required: true,
      default: "1",
      min: 1,
      max: 31,
    },
    {
      name: "category_id",
      label: "Categoria",
      type: "select",
      allowEmpty: true,
      emptyLabel: "Sem categoria",
      options: (categories.data ?? [])
        .filter((category) => category.kind === "despesa")
        .map((category) => ({ value: category.id, label: category.name })),
    },
    {
      name: "account_id",
      label: "Conta de pagamento",
      type: "select",
      allowEmpty: true,
      emptyLabel: "Sem conta definida",
      options: (accounts.data ?? [])
        .filter((account) => !account.archived)
        .map((account) => ({ value: account.id, label: account.name })),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        description="Próximos compromissos e contas recorrentes"
        action={
          <div className="flex flex-wrap gap-2">
            <RecordDialog
              table="subscriptions"
              title="Nova conta recorrente"
              fields={subscriptionFields}
              label="Recorrente"
            />
            <RecordDialog
              table="reminders"
              title="Novo lembrete"
              fields={reminderFields}
              label="Lembrete"
            />
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="A pagar"
          value={brlFromCents(toPay)}
          icon={CalendarDays}
          tone="destructive"
        />
        <StatCard label="A receber" value={brlFromCents(toReceive)} tone="success" />
        <StatCard label="Saldo previsto" value={brlFromCents(toReceive - toPay)} tone="info" />
      </div>
      {reminders.isError || subscriptions.isError ? (
        <EmptyState
          icon={CalendarDays}
          title="Não foi possível carregar a agenda"
          description="Verifique sua conexão e tente novamente."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Linha do tempo</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {reminders.isLoading ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum lembrete cadastrado.</p>
              ) : (
                rows.map((item) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-3 ${item.done ? "opacity-55" : ""}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {longDate(item.due_on)}
                        {item.done ? " · concluído" : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <span
                        className={
                          item.kind === "receita"
                            ? "num text-sm font-semibold text-success"
                            : "num text-sm font-semibold text-destructive"
                        }
                      >
                        {item.kind === "receita" ? "+" : "−"} {brlFromCents(item.amount_cents)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={updateReminder.isPending}
                        aria-label={item.done ? "Reabrir lembrete" : "Concluir lembrete"}
                        onClick={() =>
                          updateReminder.mutate({ id: item.id, values: { done: !item.done } })
                        }
                      >
                        {item.done ? (
                          <RotateCcw className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </Button>
                      <RecordActions
                        table="reminders"
                        id={item.id}
                        editTitle={`Editar ${item.title}`}
                        fields={reminderFields}
                        values={{ ...item }}
                        deleteDescription="O lembrete será excluído da agenda. Esta ação não pode ser desfeita."
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contas recorrentes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {subscriptions.isLoading ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : (subscriptions.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma conta recorrente cadastrada.
                </p>
              ) : (
                (subscriptions.data ?? []).map((item) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-3 ${item.active ? "" : "opacity-55"}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Todo dia {item.day_of_month} ·{" "}
                        {categoryNames.get(item.category_id ?? "") || "Sem categoria"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <span className="num text-sm font-semibold">
                        {brlFromCents(item.amount_cents)}
                      </span>
                      <Badge variant={item.active ? "secondary" : "outline"}>
                        {item.active ? "ativa" : "pausada"}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={updateSubscription.isPending}
                        aria-label={item.active ? "Pausar recorrência" : "Reativar recorrência"}
                        onClick={() =>
                          updateSubscription.mutate({
                            id: item.id,
                            values: { active: !item.active },
                          })
                        }
                      >
                        {item.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <RecordActions
                        table="subscriptions"
                        id={item.id}
                        editTitle={`Editar ${item.name}`}
                        fields={subscriptionFields}
                        values={{ ...item }}
                        deleteDescription="A recorrência será removida da agenda. Lançamentos já existentes não serão alterados."
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

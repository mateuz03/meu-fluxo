import { createFileRoute } from "@tanstack/react-router";
import { Target } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RecordActions } from "@/components/record-actions";
import { RecordDialog, type Field } from "@/components/record-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Tables } from "@/integrations/supabase/types";
import { useRows } from "@/lib/db";
import { brlFromCents, longDate, pct } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({ meta: [{ title: "Metas financeiras — Meu Financeiro" }] }),
  component: Metas,
});

const fields: Field[] = [
  {
    name: "name",
    label: "Nome da meta",
    type: "text",
    required: true,
    placeholder: "Ex.: Reserva de emergência",
  },
  { name: "target_cents", label: "Valor desejado", type: "money", required: true, min: 0 },
  { name: "current_cents", label: "Valor já acumulado", type: "money", default: "0", min: 0 },
  { name: "deadline", label: "Data desejada", type: "date" },
];

function Metas() {
  const goals = useRows<Tables<"financial_goals">>("financial_goals", { orderBy: "deadline" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Metas e objetivos"
        description="Progresso dos seus planos financeiros"
        action={
          <RecordDialog
            table="financial_goals"
            title="Nova meta"
            fields={fields}
            label="Nova meta"
          />
        }
      />
      {goals.isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Carregando metas...</p>
      ) : goals.isError ? (
        <EmptyState
          icon={Target}
          title="Não foi possível carregar suas metas"
          description="Verifique sua conexão e tente novamente."
        />
      ) : (goals.data ?? []).length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhuma meta cadastrada"
          description="Crie um objetivo e acompanhe sua evolução."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(goals.data ?? []).map((goal) => {
            const progress =
              goal.target_cents > 0 ? (goal.current_cents / goal.target_cents) * 100 : 0;
            const months = goal.deadline
              ? Math.max(
                  1,
                  Math.ceil(
                    (new Date(`${goal.deadline}T12:00:00`).getTime() - Date.now()) / 2_629_800_000,
                  ),
                )
              : null;
            const monthly = months
              ? Math.max(goal.target_cents - goal.current_cents, 0) / months
              : null;
            return (
              <Card key={goal.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                      <Target className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{goal.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {goal.deadline ? `Prazo: ${longDate(goal.deadline)}` : "Sem prazo definido"}
                      </p>
                    </div>
                    <RecordActions
                      table="financial_goals"
                      id={goal.id}
                      editTitle={`Editar ${goal.name}`}
                      fields={fields}
                      values={{ ...goal }}
                      deleteDescription="A meta e o histórico de contribuições vinculado a ela serão excluídos. Esta ação não pode ser desfeita."
                      className="ml-auto"
                    />
                  </div>
                  <Progress value={Math.min(progress, 100)} />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="num text-muted-foreground">
                      {brlFromCents(goal.current_cents)} de {brlFromCents(goal.target_cents)}
                    </span>
                    <span className="num font-semibold">{pct(progress)}</span>
                  </div>
                  {monthly !== null ? (
                    <p className="num rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                      Simulação de aporte: {brlFromCents(monthly)} por mês. Esta previsão é apenas
                      uma estimativa.
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

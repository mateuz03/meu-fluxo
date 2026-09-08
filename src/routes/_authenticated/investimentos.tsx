import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RecordActions } from "@/components/record-actions";
import { RecordDialog, type Field } from "@/components/record-dialog";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";
import { useRows } from "@/lib/db";
import { saoPauloToday } from "@/lib/finance";
import { brlFromCents, pct } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/investimentos")({
  head: () => ({ meta: [{ title: "Investimentos — Meu Financeiro" }] }),
  component: InvestimentosPage,
});

const colors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];
const fields: Field[] = [
  {
    name: "name",
    label: "Nome do ativo",
    type: "text",
    required: true,
    placeholder: "Ex.: Tesouro Selic",
  },
  {
    name: "asset_class",
    label: "Classe",
    type: "select",
    required: true,
    default: "Renda fixa",
    options: [
      "Reserva financeira",
      "Renda fixa",
      "Tesouro Direto",
      "Ações",
      "Fundos imobiliários",
      "ETFs",
      "Criptomoedas",
      "Internacional",
      "Outros",
    ].map((value) => ({ value, label: value })),
  },
  { name: "invested_cents", label: "Valor investido", type: "money", required: true, min: 0 },
  { name: "current_cents", label: "Valor atual informado", type: "money", required: true, min: 0 },
  {
    name: "value_updated_on",
    label: "Data da atualização",
    type: "date",
    required: true,
    default: saoPauloToday(),
  },
  { name: "notes", label: "Observações", type: "text" },
];

function InvestimentosPage() {
  const assets = useRows<Tables<"investment_assets">>("investment_assets", { orderBy: "name" });
  const rows = assets.data ?? [];
  const invested = rows.reduce((sum, asset) => sum + asset.invested_cents, 0);
  const current = rows.reduce((sum, asset) => sum + asset.current_cents, 0);
  const returnPct = invested > 0 ? ((current - invested) / invested) * 100 : 0;
  const byClass = Object.values(
    rows.reduce<Record<string, { classe: string; valor: number }>>((groups, asset) => {
      const item = groups[asset.asset_class] ?? { classe: asset.asset_class, valor: 0 };
      item.valor += asset.current_cents;
      groups[asset.asset_class] = item;
      return groups;
    }, {}),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investimentos"
        description="Valores atualizados manualmente por você"
        action={
          <RecordDialog
            table="investment_assets"
            title="Novo investimento"
            fields={fields}
            label="Novo investimento"
          />
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Valor atual" value={brlFromCents(current)} icon={TrendingUp} tone="info" />
        <StatCard
          label="Rentabilidade nominal"
          value={pct(returnPct, 1)}
          tone={returnPct >= 0 ? "success" : "destructive"}
          hint={`${brlFromCents(current - invested)} desde os aportes`}
        />
        <StatCard label="Ativos" value={String(rows.length)} />
      </div>

      {assets.isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Carregando investimentos...
        </p>
      ) : assets.isError ? (
        <EmptyState
          icon={TrendingUp}
          title="Não foi possível carregar a carteira"
          description="Verifique sua conexão e tente novamente."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Nenhum investimento cadastrado"
          description="Adicione seus investimentos usando os valores da última atualização disponível."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alocação por classe</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byClass}
                    dataKey="valor"
                    nameKey="classe"
                    innerRadius={55}
                    outerRadius={90}
                  >
                    {byClass.map((entry, index) => (
                      <Cell key={entry.classe} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => brlFromCents(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Meus ativos</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {rows.map((asset) => {
                const performance =
                  asset.invested_cents > 0
                    ? ((asset.current_cents - asset.invested_cents) / asset.invested_cents) * 100
                    : 0;
                return (
                  <div
                    key={asset.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/70 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{asset.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {asset.asset_class} · atualizado em{" "}
                        {new Date(`${asset.value_updated_on}T12:00:00`).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="text-right">
                        <p className="num text-sm font-semibold">
                          {brlFromCents(asset.current_cents)}
                        </p>
                        <Badge variant={performance >= 0 ? "secondary" : "destructive"}>
                          {pct(performance, 1)}
                        </Badge>
                      </div>
                      <RecordActions
                        table="investment_assets"
                        id={asset.id}
                        editTitle={`Editar ${asset.name}`}
                        fields={fields}
                        values={{ ...asset }}
                        deleteDescription="O ativo será removido da carteira e dos cálculos de patrimônio. Esta ação não pode ser desfeita."
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
      <p className="rounded-xl border bg-muted/40 p-4 text-xs text-muted-foreground">
        Esta aplicação é uma ferramenta de organização financeira pessoal. As informações, cálculos
        e projeções apresentadas não constituem recomendação financeira, contábil, tributária ou de
        investimento. Verifique decisões importantes com um profissional qualificado.
      </p>
    </div>
  );
}

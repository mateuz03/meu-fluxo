import { createFileRoute } from "@tanstack/react-router";
import { Landmark } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RecordDialog, type Field } from "@/components/record-dialog";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";
import { useRows } from "@/lib/db";
import { accountBalanceCents, saoPauloToday } from "@/lib/finance";
import { brlFromCents } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/patrimonio")({
  head: () => ({ meta: [{ title: "Patrimônio — Meu Financeiro" }] }),
  component: PatrimonioPage,
});

const fields: Field[] = [
  { name: "name", label: "Nome do bem", type: "text", required: true, placeholder: "Ex.: Veículo" },
  {
    name: "kind",
    label: "Tipo",
    type: "select",
    required: true,
    default: "Outro",
    options: ["Imóvel", "Veículo", "Bem pessoal", "Participação", "Outro"].map((value) => ({
      value,
      label: value,
    })),
  },
  { name: "value_cents", label: "Valor estimado", type: "money", required: true, min: 0 },
  {
    name: "value_updated_on",
    label: "Data da avaliação",
    type: "date",
    required: true,
    default: saoPauloToday(),
  },
];

function PatrimonioPage() {
  const assets = useRows<Tables<"net_worth_assets">>("net_worth_assets", { orderBy: "name" });
  const debts = useRows<Tables<"debts">>("debts");
  const accounts = useRows<Tables<"accounts">>("accounts");
  const transactions = useRows<Tables<"transactions">>("transactions");
  const investments = useRows<Tables<"investment_assets">>("investment_assets");
  const assetsValue = (assets.data ?? []).reduce((sum, asset) => sum + asset.value_cents, 0);
  const cash = (accounts.data ?? [])
    .filter((account) => !account.archived)
    .reduce((sum, account) => sum + accountBalanceCents(account, transactions.data ?? []), 0);
  const invested = (investments.data ?? []).reduce((sum, asset) => sum + asset.current_cents, 0);
  const liabilities = (debts.data ?? []).reduce((sum, debt) => sum + debt.balance_cents, 0);
  const totalAssets = assetsValue + cash + invested;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patrimônio"
        description="Contas, investimentos, bens e passivos consolidados"
        action={
          <RecordDialog
            table="net_worth_assets"
            title="Adicionar bem"
            fields={fields}
            label="Adicionar bem"
          />
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Dinheiro disponível" value={brlFromCents(cash)} tone="info" />
        <StatCard label="Investimentos" value={brlFromCents(invested)} />
        <StatCard label="Bens e ativos" value={brlFromCents(assetsValue)} icon={Landmark} />
        <StatCard
          label="Patrimônio líquido"
          value={brlFromCents(totalAssets - liabilities)}
          tone={totalAssets - liabilities >= 0 ? "success" : "destructive"}
          hint={`Passivos: ${brlFromCents(liabilities)}`}
        />
      </div>
      {assets.isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Carregando patrimônio...</p>
      ) : assets.isError ? (
        <EmptyState
          icon={Landmark}
          title="Não foi possível carregar seus bens"
          description="Verifique sua conexão e tente novamente."
        />
      ) : (assets.data ?? []).length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="Nenhum bem cadastrado"
          description="Contas e investimentos já entram no total. Adicione imóveis, veículos e outros bens aqui."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(assets.data ?? []).map((asset) => (
            <Card key={asset.id}>
              <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {asset.kind} · atualizado em{" "}
                    {new Date(`${asset.value_updated_on}T12:00:00`).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <p className="num text-sm font-semibold">{brlFromCents(asset.value_cents)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

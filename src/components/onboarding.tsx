import { Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useInsertRow, useProfile, useRows, useSaveProfile } from "@/lib/db";
import { toCents } from "@/lib/format";

const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

export function Onboarding({ children }: { children: ReactNode }) {
  const profile = useProfile();
  const saveProfile = useSaveProfile();
  const insertAccount = useInsertRow("accounts");
  const insertCard = useInsertRow("credit_cards");
  const insertCategories = useInsertRow("categories");
  const categories = useRows<Tables<"categories">>("categories");
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({
    fullName: "",
    theme: "system",
    monthlyIncome: "",
    payday: "",
    mainGoal: "",
    accountName: "",
    openingBalance: "",
    cardName: "",
    cardLimit: "",
    closingDay: "",
    dueDay: "",
  });

  useEffect(() => {
    if (profile.data?.full_name) {
      setValues((current) => ({ ...current, fullName: profile.data?.full_name ?? "" }));
    }
  }, [profile.data?.full_name]);

  const pending =
    saveProfile.isPending ||
    insertAccount.isPending ||
    insertCard.isPending ||
    insertCategories.isPending;

  async function finish() {
    if (categories.isSuccess && categories.data.length === 0) {
      await insertCategories.mutateAsync([
        { name: "Salário", kind: "receita", color: "#10b981", icon: "wallet" },
        { name: "Outras receitas", kind: "receita", color: "#22c55e", icon: "circle-plus" },
        { name: "Moradia", kind: "despesa", color: "#1e3a8a", icon: "house" },
        { name: "Alimentação", kind: "despesa", color: "#f59e0b", icon: "utensils" },
        { name: "Transporte", kind: "despesa", color: "#3b82f6", icon: "car" },
        { name: "Saúde", kind: "despesa", color: "#ef4444", icon: "heart-pulse" },
        { name: "Lazer", kind: "despesa", color: "#8b5cf6", icon: "sparkles" },
        { name: "Outras despesas", kind: "despesa", color: "#64748b", icon: "receipt" },
      ]);
    }

    if (values.accountName.trim()) {
      await insertAccount.mutateAsync({
        name: values.accountName.trim(),
        type: "corrente",
        opening_balance_cents: toCents(values.openingBalance),
        currency: "BRL",
      });
    }

    if (values.cardName.trim()) {
      await insertCard.mutateAsync({
        name: values.cardName.trim(),
        limit_cents: toCents(values.cardLimit),
        closing_day: values.closingDay ? Number(values.closingDay) : 1,
        due_day: values.dueDay ? Number(values.dueDay) : 10,
      });
    }

    await saveProfile.mutateAsync({
      full_name: values.fullName.trim() || profile.data?.full_name || null,
      currency: "BRL",
      theme: values.theme,
      monthly_income_cents: toCents(values.monthlyIncome),
      payday: values.payday ? Number(values.payday) : null,
      main_goal: values.mainGoal.trim() || null,
      onboarding_done: true,
    });

    if (values.theme === "system") {
      localStorage.removeItem("meu-financeiro-theme");
      document.documentElement.classList.toggle(
        "dark",
        window.matchMedia("(prefers-color-scheme: dark)").matches,
      );
    } else {
      localStorage.setItem("meu-financeiro-theme", values.theme);
      document.documentElement.classList.toggle("dark", values.theme === "dark");
    }
  }

  if (profile.isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
        Preparando sua conta...
      </div>
    );
  }

  return (
    <>
      {children}
      <Dialog
        open={!profile.isLoading && profile.data?.onboarding_done !== true}
        onOpenChange={() => undefined}
      >
        <DialogContent className="sm:max-w-lg" aria-describedby="onboarding-description">
          <DialogHeader>
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Etapa {step + 1} de 3
              </span>
            </div>
            <DialogTitle>
              {["Vamos personalizar", "Seu mês financeiro", "Primeiros cadastros"][step]}
            </DialogTitle>
            <DialogDescription id="onboarding-description">
              {
                [
                  "Defina como você quer ver o aplicativo.",
                  "Esses dados ajudam a contextualizar suas metas. Você pode alterá-los depois.",
                  "Cadastre uma conta e um cartão agora ou deixe para mais tarde.",
                ][step]
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {step === 0 ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="onboarding-name">Seu nome</Label>
                  <Input
                    id="onboarding-name"
                    value={values.fullName}
                    onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
                    placeholder="Como prefere ser chamado?"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="onboarding-theme">Tema</Label>
                  <Select
                    value={values.theme}
                    onValueChange={(theme) => setValues((v) => ({ ...v, theme }))}
                  >
                    <SelectTrigger id="onboarding-theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">Automático</SelectItem>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="monthly-income">Renda mensal estimada</Label>
                    <Input
                      id="monthly-income"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={values.monthlyIncome}
                      onChange={(e) => setValues((v) => ({ ...v, monthlyIncome: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="payday">Dia de recebimento</Label>
                    <Input
                      id="payday"
                      type="number"
                      min={1}
                      max={31}
                      value={values.payday}
                      onChange={(e) => setValues((v) => ({ ...v, payday: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="main-goal">Objetivo financeiro inicial</Label>
                  <Input
                    id="main-goal"
                    placeholder="Ex.: montar minha reserva"
                    value={values.mainGoal}
                    onChange={(e) => setValues((v) => ({ ...v, mainGoal: e.target.value }))}
                  />
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div className="rounded-xl border p-4">
                  <p className="mb-3 text-sm font-semibold">Conta bancária (opcional)</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      aria-label="Nome da conta"
                      placeholder="Nome da conta"
                      value={values.accountName}
                      onChange={(e) => setValues((v) => ({ ...v, accountName: e.target.value }))}
                    />
                    <Input
                      aria-label="Saldo inicial"
                      inputMode="decimal"
                      placeholder="Saldo inicial"
                      value={values.openingBalance}
                      onChange={(e) => setValues((v) => ({ ...v, openingBalance: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="mb-3 text-sm font-semibold">Cartão (opcional)</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      aria-label="Nome do cartão"
                      placeholder="Nome do cartão"
                      value={values.cardName}
                      onChange={(e) => setValues((v) => ({ ...v, cardName: e.target.value }))}
                    />
                    <Input
                      aria-label="Limite do cartão"
                      inputMode="decimal"
                      placeholder="Limite"
                      value={values.cardLimit}
                      onChange={(e) => setValues((v) => ({ ...v, cardLimit: e.target.value }))}
                    />
                    <Input
                      aria-label="Dia de fechamento"
                      type="number"
                      min={1}
                      max={31}
                      placeholder="Dia de fechamento"
                      value={values.closingDay}
                      onChange={(e) => setValues((v) => ({ ...v, closingDay: e.target.value }))}
                    />
                    <Input
                      aria-label="Dia de vencimento"
                      type="number"
                      min={1}
                      max={31}
                      placeholder="Dia de vencimento"
                      value={values.dueDay}
                      onChange={(e) => setValues((v) => ({ ...v, dueDay: e.target.value }))}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Data de configuração: {new Date(`${today}T12:00:00`).toLocaleDateString("pt-BR")}
                </p>
              </>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              disabled={pending || step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              <ChevronLeft className="h-4 w-4" /> Voltar
            </Button>
            {step < 2 ? (
              <Button type="button" onClick={() => setStep((s) => s + 1)}>
                Continuar <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" disabled={pending} onClick={finish}>
                <Check className="h-4 w-4" /> {pending ? "Concluindo..." : "Começar a usar"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

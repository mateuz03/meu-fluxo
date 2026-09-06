import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export type TableName =
  | "profiles"
  | "accounts"
  | "categories"
  | "credit_cards"
  | "transactions"
  | "card_installments"
  | "budgets"
  | "subscriptions"
  | "investment_assets"
  | "financial_goals"
  | "goal_contributions"
  | "debts"
  | "net_worth_assets"
  | "reminders";

export function useRows<T = Record<string, unknown>>(
  table: TableName,
  opts: { orderBy?: string; ascending?: boolean } = {},
) {
  return useQuery({
    queryKey: [table, opts.orderBy ?? "", opts.ascending ?? true],
    queryFn: async () => {
      let q = supabase.from(table).select("*");
      if (opts.orderBy) q = q.order(opts.orderBy, { ascending: opts.ascending ?? true });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useInsertRow(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Sessão expirada. Entre novamente.");
      const payload = table === "profiles" ? values : { ...values, user_id: userId };
      const { error } = await supabase.from(table).insert(payload as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Registro salvo");
    },
    onError: (e: Error) => toast.error("Não foi possível salvar", { description: e.message }),
  });
}

export function useDeleteRow(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Registro excluído");
    },
    onError: (e: Error) => toast.error("Não foi possível excluir", { description: e.message }),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

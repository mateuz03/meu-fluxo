import { ArrowLeftRight, Ban, Pencil } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/integrations/supabase/types";
import { useCancelAccountTransfer, useSaveAccountTransfer } from "@/lib/db";
import { saoPauloToday } from "@/lib/finance";
import { toCents } from "@/lib/format";

export type AccountTransfer = {
  groupId: string;
  fromAccountId: string;
  toAccountId: string;
  amountCents: number;
  occurredOn: string;
  description: string;
  notes?: string;
  status: Tables<"transactions">["status"];
};

function initialForm(transfer?: AccountTransfer) {
  return {
    fromAccountId: transfer?.fromAccountId ?? "",
    toAccountId: transfer?.toAccountId ?? "",
    amount: transfer ? (transfer.amountCents / 100).toFixed(2) : "",
    occurredOn: transfer?.occurredOn ?? saoPauloToday(),
    description: transfer?.description ?? "Transferência entre contas",
    notes: transfer?.notes ?? "",
  };
}

export function TransferDialog({
  accounts,
  transfer,
  trigger,
}: {
  accounts: Tables<"accounts">[];
  transfer?: AccountTransfer;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => initialForm(transfer));
  const saveTransfer = useSaveAccountTransfer();
  const availableAccounts = accounts.filter(
    (account) =>
      !account.archived ||
      account.id === transfer?.fromAccountId ||
      account.id === transfer?.toAccountId,
  );

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setForm(initialForm(transfer));
    setOpen(nextOpen);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.fromAccountId || !form.toAccountId) {
      toast.error("Selecione as contas de origem e destino.");
      return;
    }
    if (form.fromAccountId === form.toAccountId) {
      toast.error("As contas de origem e destino devem ser diferentes.");
      return;
    }

    try {
      const amountCents = toCents(form.amount);
      if (amountCents <= 0) {
        toast.error("Informe um valor maior que zero.");
        return;
      }
      saveTransfer.mutate(
        {
          ...(transfer ? { transferGroupId: transfer.groupId } : {}),
          fromAccountId: form.fromAccountId,
          toAccountId: form.toAccountId,
          amountCents,
          occurredOn: form.occurredOn,
          description: form.description.trim() || "Transferência entre contas",
          notes: form.notes.trim(),
        },
        { onSuccess: () => setOpen(false) },
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Informe um valor válido.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={availableAccounts.length < 2}
            title={
              availableAccounts.length < 2
                ? "Cadastre pelo menos duas contas ativas para transferir"
                : undefined
            }
          >
            <ArrowLeftRight className="h-4 w-4" /> Transferir
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transfer ? "Editar transferência" : "Transferir entre contas"}</DialogTitle>
          <DialogDescription>
            A movimentação altera os saldos das duas contas, sem contar como receita ou despesa.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <Label htmlFor="transfer-from">Conta de origem</Label>
            <Select
              value={form.fromAccountId}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, fromAccountId: value }))
              }
            >
              <SelectTrigger id="transfer-from">
                <SelectValue placeholder="Selecione a origem" />
              </SelectTrigger>
              <SelectContent>
                {availableAccounts
                  .filter((account) => account.id !== form.toAccountId)
                  .map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transfer-to">Conta de destino</Label>
            <Select
              value={form.toAccountId}
              onValueChange={(value) => setForm((current) => ({ ...current, toAccountId: value }))}
            >
              <SelectTrigger id="transfer-to">
                <SelectValue placeholder="Selecione o destino" />
              </SelectTrigger>
              <SelectContent>
                {availableAccounts
                  .filter((account) => account.id !== form.fromAccountId)
                  .map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="transfer-amount">Valor</Label>
              <Input
                id="transfer-amount"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                required
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, amount: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="transfer-date">Data</Label>
              <Input
                id="transfer-date"
                type="date"
                required
                value={form.occurredOn}
                onChange={(event) =>
                  setForm((current) => ({ ...current, occurredOn: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transfer-description">Descrição</Label>
            <Input
              id="transfer-description"
              required
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transfer-notes">Observações</Label>
            <Textarea
              id="transfer-notes"
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={saveTransfer.isPending}>
              {saveTransfer.isPending
                ? "Salvando..."
                : transfer
                  ? "Salvar transferência"
                  : "Confirmar transferência"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TransferActions({
  accounts,
  transfer,
}: {
  accounts: Tables<"accounts">[];
  transfer: AccountTransfer;
}) {
  const cancelTransfer = useCancelAccountTransfer();

  return (
    <div className="flex shrink-0 items-center">
      {transfer.status !== "cancelado" ? (
        <>
          <TransferDialog
            accounts={accounts}
            transfer={transfer}
            trigger={
              <Button type="button" variant="ghost" size="icon" aria-label="Editar transferência">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                aria-label="Cancelar transferência"
              >
                <Ban className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar esta transferência?</AlertDialogTitle>
                <AlertDialogDescription>
                  Os dois lados serão cancelados juntos e deixarão de alterar os saldos. O histórico
                  será preservado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Voltar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={cancelTransfer.isPending}
                  onClick={() => cancelTransfer.mutate(transfer.groupId)}
                >
                  {cancelTransfer.isPending ? "Cancelando..." : "Cancelar transferência"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : null}
    </div>
  );
}

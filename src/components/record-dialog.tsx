import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { useInsertRow, useUpdateRow, type TableName } from "@/lib/db";
import { toCents } from "@/lib/format";

export type Field = {
  name: string;
  label: string;
  type: "text" | "money" | "number" | "date" | "select";
  required?: boolean;
  default?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  allowEmpty?: boolean;
  emptyLabel?: string;
};

const EMPTY_SELECT_VALUE = "__empty__";

function fieldValues(fields: Field[], initialValues?: Record<string, unknown>) {
  return Object.fromEntries(
    fields.map((field) => {
      const hasInitialValue = Object.prototype.hasOwnProperty.call(initialValues ?? {}, field.name);
      const raw = initialValues?.[field.name] ?? field.default ?? "";
      if (raw === null || raw === undefined || raw === "") {
        return [field.name, field.type === "select" && field.allowEmpty ? EMPTY_SELECT_VALUE : ""];
      }
      if (field.type === "money" && hasInitialValue) {
        return [field.name, (Number(raw) / 100).toFixed(2)];
      }
      return [field.name, String(raw)];
    }),
  );
}

export function RecordDialog({
  table,
  title,
  fields,
  trigger,
  label = "Adicionar",
  recordId,
  initialValues,
}: {
  table: TableName;
  title: string;
  fields: Field[];
  trigger?: ReactNode;
  label?: string;
  recordId?: string;
  initialValues?: Record<string, unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    fieldValues(fields, initialValues),
  );
  const insert = useInsertRow(table);
  const update = useUpdateRow(table);
  const pending = recordId ? update.isPending : insert.isPending;

  function get(f: Field) {
    return values[f.name] ?? f.default ?? "";
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setValues(fieldValues(fields, initialValues));
    setOpen(nextOpen);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: Record<string, unknown> = {};
      for (const f of fields) {
        const raw = get(f);
        if (raw === EMPTY_SELECT_VALUE) {
          payload[f.name] = null;
          continue;
        }
        if (raw === "") {
          if (recordId) payload[f.name] = null;
          continue;
        }
        if (f.type === "money") payload[f.name] = toCents(raw);
        else if (f.type === "number") payload[f.name] = Number(raw);
        else payload[f.name] = raw;
      }
      const onSuccess = () => {
        setValues(fieldValues(fields, initialValues));
        setOpen(false);
      };
      if (recordId) update.mutate({ id: recordId, values: payload }, { onSuccess });
      else insert.mutate(payload, { onSuccess });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verifique os dados informados.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> {label}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label htmlFor={f.name}>{f.label}</Label>
              {f.type === "select" ? (
                <Select
                  value={get(f)}
                  onValueChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))}
                >
                  <SelectTrigger id={f.name}>
                    <SelectValue placeholder={f.placeholder ?? "Selecione"} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.allowEmpty ? (
                      <SelectItem value={EMPTY_SELECT_VALUE}>{f.emptyLabel ?? "Nenhum"}</SelectItem>
                    ) : null}
                    {(f.options ?? []).map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={f.name}
                  type={f.type === "date" ? "date" : f.type === "text" ? "text" : "number"}
                  step={f.type === "money" ? "0.01" : undefined}
                  inputMode={f.type === "text" ? undefined : "decimal"}
                  required={f.required}
                  min={f.min}
                  max={f.max}
                  placeholder={f.placeholder}
                  value={get(f)}
                  onChange={(e) => setValues((s) => ({ ...s, [f.name]: e.target.value }))}
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Salvando..." : recordId ? "Salvar alterações" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";

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
import { useInsertRow, type TableName } from "@/lib/db";
import { toCents } from "@/lib/format";

export type Field = {
  name: string;
  label: string;
  type: "text" | "money" | "number" | "date" | "select";
  required?: boolean;
  default?: string;
  options?: { value: string; label: string }[];
};

export function RecordDialog({
  table,
  title,
  fields,
  trigger,
  label = "Adicionar",
}: {
  table: TableName;
  title: string;
  fields: Field[];
  trigger?: ReactNode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const insert = useInsertRow(table);

  function get(f: Field) {
    return values[f.name] ?? f.default ?? "";
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const raw = get(f);
      if (raw === "") continue;
      if (f.type === "money") payload[f.name] = toCents(raw);
      else if (f.type === "number") payload[f.name] = Number(raw);
      else payload[f.name] = raw;
    }
    insert.mutate(payload, {
      onSuccess: () => {
        setValues({});
        setOpen(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
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
                  value={get(f)}
                  onChange={(e) => setValues((s) => ({ ...s, [f.name]: e.target.value }))}
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="submit" disabled={insert.isPending} className="w-full">
              {insert.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

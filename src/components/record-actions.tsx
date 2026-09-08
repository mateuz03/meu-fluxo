import { Archive, ArchiveRestore, Pencil, Trash2 } from "lucide-react";

import { RecordDialog, type Field } from "@/components/record-dialog";
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
import { useDeleteRow, useUpdateRow, type TableName } from "@/lib/db";
import { cn } from "@/lib/utils";

type ArchiveOption = {
  archived: boolean;
  noun: string;
};

export function RecordActions({
  table,
  id,
  editTitle,
  fields,
  values,
  deleteDescription,
  archive,
  className,
}: {
  table: TableName;
  id: string;
  editTitle: string;
  fields: Field[];
  values: Record<string, unknown>;
  deleteDescription?: string;
  archive?: ArchiveOption;
  className?: string;
}) {
  const remove = useDeleteRow(table);
  const update = useUpdateRow(table);

  const editTrigger = (
    <Button type="button" variant="ghost" size="icon" aria-label={editTitle}>
      <Pencil className="h-4 w-4" />
    </Button>
  );

  return (
    <div className={cn("flex shrink-0 items-center", className)}>
      <RecordDialog
        table={table}
        title={editTitle}
        fields={fields}
        recordId={id}
        initialValues={values}
        trigger={editTrigger}
      />
      {archive ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`${archive.archived ? "Reativar" : "Arquivar"} ${archive.noun}`}
          disabled={update.isPending}
          onClick={() => update.mutate({ id, values: { archived: !archive.archived } })}
        >
          {archive.archived ? (
            <ArchiveRestore className="h-4 w-4" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
        </Button>
      ) : null}
      {deleteDescription ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              aria-label={`Excluir ${editTitle.replace(/^Editar\s+/i, "")}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir este registro?</AlertDialogTitle>
              <AlertDialogDescription>{deleteDescription}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={remove.isPending}
                onClick={() => remove.mutate(id)}
              >
                {remove.isPending ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
}

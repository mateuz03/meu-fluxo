import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "neutral" | "success" | "destructive" | "warning" | "info";
}) {
  const tones = {
    neutral: "bg-secondary text-secondary-foreground",
    success: "bg-success/12 text-success",
    destructive: "bg-destructive/12 text-destructive",
    warning: "bg-warning/18 text-warning-foreground",
    info: "bg-info/12 text-info",
  } as const;

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="flex items-start gap-3 p-5">
        {Icon ? (
          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", tones[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="num mt-1 text-xl font-bold sm:text-2xl">{value}</p>
          {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

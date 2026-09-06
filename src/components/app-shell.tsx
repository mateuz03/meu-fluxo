import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  CreditCard,
  PiggyBank,
  Target,
  TrendingUp,
  Landmark,
  Receipt,
  CalendarDays,
  BarChart3,
  Settings,
  Menu,
  Plus,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { to: "/", label: "Visão geral", icon: LayoutDashboard },
  { to: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { to: "/contas", label: "Contas", icon: Wallet },
  { to: "/cartoes", label: "Cartões", icon: CreditCard },
  { to: "/orcamentos", label: "Orçamentos", icon: PiggyBank },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/investimentos", label: "Investimentos", icon: TrendingUp },
  { to: "/patrimonio", label: "Patrimônio", icon: Landmark },
  { to: "/dividas", label: "Dívidas", icon: Receipt },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/configuracoes", label: "Ajustes", icon: Settings },
] as const;

const bottomItems = navItems.filter((i) =>
  ["/", "/transacoes", "/agenda", "/metas"].includes(i.to),
);

function useThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = window.localStorage.getItem("meu-financeiro-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(saved ? saved === "dark" : prefersDark);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("meu-financeiro-theme", dark ? "dark" : "light");
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-2 py-1">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground font-display text-lg font-bold">
        M
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-base font-semibold text-sidebar-foreground">
          Meu Financeiro
        </p>
        <p className="truncate text-xs text-sidebar-foreground/60">Seus dados, sua privacidade</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useThemeToggle();
  const navigate = useNavigate();

  async function logout() {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      toast.error("Não foi possível sair. Tente novamente.");
      return;
    }
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-6 overflow-y-auto bg-sidebar p-4 lg:flex">
        <Brand />
        <NavList />
        <div className="mt-auto grid gap-3">
          <p className="rounded-xl bg-sidebar-accent p-3 text-[11px] leading-relaxed text-sidebar-accent-foreground/80">
            Este app organiza suas finanças e não constitui recomendação de investimento.
          </p>
          <Button
            variant="ghost"
            className="justify-start gap-2 text-sidebar-foreground/80"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar p-4">
                <div className="mt-6 flex flex-col gap-6">
                  <Brand />
                  <NavList onNavigate={() => setOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <span className="truncate font-display text-sm font-semibold sm:text-base">
              Meu Financeiro
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button size="sm" className="gap-1.5" asChild>
              <Link to="/transacoes">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo lançamento</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        {bottomItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground data-[status=active]:text-primary"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

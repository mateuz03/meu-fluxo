import { createFileRoute } from "@tanstack/react-router";
import { Filter, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/empty-state";
import { brl, shortDate } from "@/lib/format";
import { movimentos } from "@/lib/mock-data";

export const Route = createFileRoute("/transacoes")({
  head: () => ({
    meta: [
      { title: "Transações — Meu Financeiro" },
      { name: "description", content: "Registre e filtre receitas e despesas por conta, categoria e status." },
      { property: "og:title", content: "Transações — Meu Financeiro" },
      { property: "og:description", content: "Lista completa de receitas e despesas com filtros." },
    ],
  }),
  component: Transacoes,
});

function Transacoes() {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("todos");

  const lista = useMemo(
    () =>
      movimentos.filter(
        (m) =>
          (tipo === "todos" || m.tipo === tipo) &&
          `${m.descricao} ${m.categoria} ${m.conta}`.toLowerCase().includes(busca.toLowerCase()),
      ),
    [busca, tipo],
  );

  const receitas = lista.filter((m) => m.tipo === "receita").reduce((s, m) => s + m.valor, 0);
  const despesas = lista.filter((m) => m.tipo === "despesa").reduce((s, m) => s + m.valor, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transações"
        description="Todos os lançamentos do período selecionado"
        action={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Novo
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por descrição, categoria ou conta"
            className="pl-9"
          />
        </div>
        <Tabs value={tipo} onValueChange={setTipo}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="receita">Receitas</TabsTrigger>
            <TabsTrigger value="despesa">Despesas</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="icon" aria-label="Filtros avançados">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Entradas</p>
            <p className="num text-lg font-bold text-success">{brl(receitas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Saídas</p>
            <p className="num text-lg font-bold text-destructive">{brl(despesas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Resultado</p>
            <p className="num text-lg font-bold">{brl(receitas - despesas)}</p>
          </CardContent>
        </Card>
      </div>

      {lista.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum lançamento encontrado"
          description="Ajuste os filtros ou registre um novo lançamento para começar."
          actionLabel="Adicionar lançamento"
        />
      ) : (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {lista.map((m) => (
              <div key={m.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 sm:px-5">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-medium">{m.descricao}</p>
                    {m.parcela ? <Badge variant="outline">{m.parcela}</Badge> : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {shortDate(m.data)} · {m.categoria} · {m.conta}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={`num text-sm font-semibold ${m.tipo === "receita" ? "text-success" : "text-destructive"}`}>
                    {m.tipo === "receita" ? "+" : "−"} {brl(m.valor)}
                  </span>
                  <Badge variant={m.status === "pago" ? "secondary" : "outline"}>{m.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

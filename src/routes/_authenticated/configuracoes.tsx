import { createFileRoute } from "@tanstack/react-router";
import { Download, ShieldCheck, Trash2, UserRound } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Ajustes — Meu Financeiro" },
      {
        name: "description",
        content: "Preferências da conta, categorias, exportação de dados e privacidade.",
      },
      { property: "og:title", content: "Ajustes — Meu Financeiro" },
      {
        property: "og:description",
        content: "Preferências da conta, categorias, exportação de dados e privacidade.",
      },
    ],
  }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  return (
    <div>
      <PageHeader title="Ajustes" description="Preferências e dados da sua conta." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4" /> Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>Nome, e-mail e moeda padrão (Real brasileiro).</p>
            <Separator className="my-2" />
            <p>Login e senha serão ativados junto com o banco de dados.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-4 w-4" /> Meus dados
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="text-sm text-muted-foreground">
              Exporte tudo em CSV ou apague sua conta a qualquer momento.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Download className="h-4 w-4" /> Exportar CSV
              </Button>
              <Button size="sm" variant="destructive" className="gap-1.5">
                <Trash2 className="h-4 w-4" /> Apagar conta
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4" /> Segurança e privacidade
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Este protótipo usa apenas dados fictícios. Nenhuma informação financeira real deve ser
            cadastrada antes da revisão final de segurança. O app organiza suas finanças e não
            constitui recomendação de investimento.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

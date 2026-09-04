// Dados fictícios usados apenas para validação do design.
// Nenhum dado financeiro real deve ser inserido antes da revisão de segurança.

export type Movimento = {
  id: string;
  descricao: string;
  categoria: string;
  conta: string;
  data: string;
  valor: number;
  tipo: "receita" | "despesa";
  status: "pago" | "pendente";
  parcela?: string;
};

export const resumoMes = {
  referencia: "Setembro de 2026",
  receitas: 14250,
  despesas: 9312.44,
  saldoPrevisto: 4937.56,
  saldoAtual: 27840.19,
  faturasAbertas: 4218.77,
  reservaEmergencia: 32000,
  reservaMeta: 48000,
};

export const fluxoMensal = [
  { mes: "Abr", receitas: 13200, despesas: 9800 },
  { mes: "Mai", receitas: 13400, despesas: 10250 },
  { mes: "Jun", receitas: 15900, despesas: 9110 },
  { mes: "Jul", receitas: 13800, despesas: 11480 },
  { mes: "Ago", receitas: 14100, despesas: 8930 },
  { mes: "Set", receitas: 14250, despesas: 9312 },
];

export const evolucaoPatrimonio = [
  { mes: "Abr", valor: 168400 },
  { mes: "Mai", valor: 172950 },
  { mes: "Jun", valor: 181300 },
  { mes: "Jul", valor: 184120 },
  { mes: "Ago", valor: 191760 },
  { mes: "Set", valor: 198430 },
];

export const despesasPorCategoria = [
  { categoria: "Moradia", valor: 3200, cor: "var(--color-chart-2)" },
  { categoria: "Alimentação", valor: 1840, cor: "var(--color-chart-1)" },
  { categoria: "Transporte", valor: 980, cor: "var(--color-chart-3)" },
  { categoria: "Saúde", valor: 720, cor: "var(--color-chart-5)" },
  { categoria: "Lazer", valor: 640, cor: "var(--color-chart-4)" },
  { categoria: "Educação", valor: 932, cor: "var(--color-chart-2)" },
];

export const contas = [
  { id: "c1", nome: "Nubank", tipo: "Conta corrente", saldo: 8420.55, cor: "#8A05BE" },
  { id: "c2", nome: "Itaú", tipo: "Conta corrente", saldo: 3110.2, cor: "#EC7000" },
  { id: "c3", nome: "Inter", tipo: "Conta pagamento", saldo: 1290.44, cor: "#FF7A00" },
  { id: "c4", nome: "Caixa Reserva", tipo: "Poupança", saldo: 15019.0, cor: "#0057A6" },
];

export const cartoes = [
  {
    id: "k1",
    nome: "Nubank Ultravioleta",
    bandeira: "Mastercard",
    limite: 12000,
    fatura: 2418.9,
    fechamento: "28/09",
    vencimento: "05/10",
  },
  {
    id: "k2",
    nome: "Itaú Click",
    bandeira: "Visa",
    limite: 8000,
    fatura: 1299.87,
    fechamento: "02/10",
    vencimento: "10/10",
  },
  {
    id: "k3",
    nome: "Inter Gold",
    bandeira: "Mastercard",
    limite: 5000,
    fatura: 500.0,
    fechamento: "05/10",
    vencimento: "15/10",
  },
];

export const parceladas = [
  { id: "p1", descricao: "Notebook Dell", cartao: "Nubank Ultravioleta", parcela: 4, total: 10, valor: 489.9 },
  { id: "p2", descricao: "Passagens Recife", cartao: "Itaú Click", parcela: 2, total: 6, valor: 312.5 },
  { id: "p3", descricao: "Cadeira ergonômica", cartao: "Inter Gold", parcela: 8, total: 12, valor: 166.6 },
];

export const recorrentes = [
  { id: "r1", nome: "Aluguel", valor: 2600, dia: 5, categoria: "Moradia", status: "pago" as const },
  { id: "r2", nome: "Internet fibra", valor: 129.9, dia: 10, categoria: "Moradia", status: "pendente" as const },
  { id: "r3", nome: "Plano de saúde", valor: 618.4, dia: 12, categoria: "Saúde", status: "pendente" as const },
  { id: "r4", nome: "Academia", valor: 149.9, dia: 15, categoria: "Saúde", status: "pendente" as const },
  { id: "r5", nome: "Streaming", valor: 89.7, dia: 18, categoria: "Lazer", status: "pendente" as const },
];

export const movimentos: Movimento[] = [
  { id: "m1", descricao: "Salário", categoria: "Renda fixa", conta: "Itaú", data: "2026-09-01", valor: 11800, tipo: "receita", status: "pago" },
  { id: "m2", descricao: "Aluguel", categoria: "Moradia", conta: "Itaú", data: "2026-09-05", valor: 2600, tipo: "despesa", status: "pago" },
  { id: "m3", descricao: "Freela design", categoria: "Renda variável", conta: "Nubank", data: "2026-09-06", valor: 2450, tipo: "receita", status: "pago" },
  { id: "m4", descricao: "Supermercado Pão de Açúcar", categoria: "Alimentação", conta: "Nubank Ultravioleta", data: "2026-09-07", valor: 742.31, tipo: "despesa", status: "pago" },
  { id: "m5", descricao: "Notebook Dell", categoria: "Equipamentos", conta: "Nubank Ultravioleta", data: "2026-09-08", valor: 489.9, tipo: "despesa", status: "pago", parcela: "4/10" },
  { id: "m6", descricao: "Combustível", categoria: "Transporte", conta: "Inter", data: "2026-09-09", valor: 310.0, tipo: "despesa", status: "pago" },
  { id: "m7", descricao: "Plano de saúde", categoria: "Saúde", conta: "Itaú", data: "2026-09-12", valor: 618.4, tipo: "despesa", status: "pendente" },
  { id: "m8", descricao: "Cinema e jantar", categoria: "Lazer", conta: "Itaú Click", data: "2026-09-13", valor: 186.9, tipo: "despesa", status: "pago" },
  { id: "m9", descricao: "Curso de inglês", categoria: "Educação", conta: "Nubank", data: "2026-09-15", valor: 432.0, tipo: "despesa", status: "pendente" },
  { id: "m10", descricao: "Dividendos", categoria: "Investimentos", conta: "Nubank", data: "2026-09-16", valor: 218.44, tipo: "receita", status: "pago" },
];

export const orcamentos = [
  { id: "o1", categoria: "Moradia", limite: 3400, gasto: 3200 },
  { id: "o2", categoria: "Alimentação", limite: 1700, gasto: 1840 },
  { id: "o3", categoria: "Transporte", limite: 1200, gasto: 980 },
  { id: "o4", categoria: "Lazer", limite: 800, gasto: 640 },
  { id: "o5", categoria: "Saúde", limite: 900, gasto: 720 },
  { id: "o6", categoria: "Educação", limite: 900, gasto: 932 },
];

export const metas = [
  { id: "g1", nome: "Reserva de emergência", alvo: 48000, atual: 32000, prazo: "2027-06-30" },
  { id: "g2", nome: "Viagem Japão", alvo: 28000, atual: 9400, prazo: "2027-10-01" },
  { id: "g3", nome: "Entrada do apartamento", alvo: 120000, atual: 41200, prazo: "2029-01-15" },
  { id: "g4", nome: "Troca do carro", alvo: 60000, atual: 12800, prazo: "2028-03-30" },
];

export const investimentos = [
  { id: "i1", nome: "Tesouro IPCA+ 2035", classe: "Renda fixa", valor: 42800, rentabilidade: 8.4 },
  { id: "i2", nome: "CDB Liquidez Diária", classe: "Renda fixa", valor: 31900, rentabilidade: 10.9 },
  { id: "i3", nome: "ETF IVVB11", classe: "Renda variável", valor: 26400, rentabilidade: 14.2 },
  { id: "i4", nome: "FII HGLG11", classe: "Fundos imobiliários", valor: 18300, rentabilidade: 6.1 },
  { id: "i5", nome: "Bitcoin", classe: "Cripto", valor: 9800, rentabilidade: -4.7 },
];

export const patrimonio = [
  { id: "a1", nome: "Apartamento", tipo: "Imóvel", valor: 420000 },
  { id: "a2", nome: "Carro Honda City", tipo: "Veículo", valor: 78000 },
  { id: "a3", nome: "Carteira de investimentos", tipo: "Financeiro", valor: 129200 },
  { id: "a4", nome: "Contas bancárias", tipo: "Financeiro", valor: 27840 },
];

export const dividas = [
  { id: "d1", nome: "Financiamento imóvel", credor: "Caixa", saldo: 268400, parcela: 2180, taxa: 9.2, restantes: 214 },
  { id: "d2", nome: "Financiamento carro", credor: "Itaú", saldo: 31200, parcela: 980, taxa: 18.4, restantes: 36 },
  { id: "d3", nome: "Crédito pessoal", credor: "Nubank", saldo: 6400, parcela: 540, taxa: 32.1, restantes: 13 },
];

export const agenda = [
  { id: "e1", data: "2026-09-10", titulo: "Internet fibra", valor: 129.9, tipo: "despesa" as const },
  { id: "e2", data: "2026-09-12", titulo: "Plano de saúde", valor: 618.4, tipo: "despesa" as const },
  { id: "e3", data: "2026-09-15", titulo: "Curso de inglês", valor: 432, tipo: "despesa" as const },
  { id: "e4", data: "2026-09-20", titulo: "Pagamento freela", valor: 1800, tipo: "receita" as const },
  { id: "e5", data: "2026-10-05", titulo: "Fatura Nubank", valor: 2418.9, tipo: "despesa" as const },
  { id: "e6", data: "2026-10-10", titulo: "Fatura Itaú Click", valor: 1299.87, tipo: "despesa" as const },
];

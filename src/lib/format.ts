export const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const fromCents = (value: number | null | undefined) => (value ?? 0) / 100;

export const brlFromCents = (value: number | null | undefined) => brl(fromCents(value));

/**
 * Converte um valor digitado em reais para centavos inteiros.
 * Aceita tanto o formato brasileiro (1.234,56) quanto o formato de inputs
 * numéricos do navegador (1234.56), sem usar ponto flutuante no banco.
 */
export function toCents(value: string | number): number {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Informe um valor válido.");
    return Math.round(value * 100);
  }

  const cleaned = value.trim().replace(/R\$/gi, "").replace(/\s/g, "");
  if (!cleaned) return 0;

  const negative = cleaned.startsWith("-");
  const unsigned = cleaned.replace(/[^0-9.,]/g, "");
  const lastComma = unsigned.lastIndexOf(",");
  const lastDot = unsigned.lastIndexOf(".");
  const decimalIndex = Math.max(lastComma, lastDot);

  let integerDigits = unsigned.replace(/\D/g, "");
  let decimalDigits = "";

  if (decimalIndex >= 0) {
    const digitsAfterSeparator = unsigned.slice(decimalIndex + 1).replace(/\D/g, "");
    const separatorIsDecimal =
      digitsAfterSeparator.length > 0 &&
      digitsAfterSeparator.length <= 2 &&
      (lastComma >= 0 || (unsigned.match(/\./g)?.length ?? 0) === 1);

    if (separatorIsDecimal) {
      integerDigits = unsigned.slice(0, decimalIndex).replace(/\D/g, "") || "0";
      decimalDigits = digitsAfterSeparator.padEnd(2, "0");
    }
  }

  const cents = Number(integerDigits || "0") * 100 + Number(decimalDigits || "0");
  if (!Number.isSafeInteger(cents)) throw new Error("O valor informado é muito alto.");
  return negative ? -cents : cents;
}

export const pct = (value: number, digits = 0) =>
  `${value.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;

export const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

export const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

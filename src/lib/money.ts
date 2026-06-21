const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getFormatter(currencyCode: string) {
  let formatter = currencyFormatters.get(currencyCode);
  if (!formatter) {
    formatter = new Intl.NumberFormat("es-AR", {
      currency: currencyCode,
      style: "currency",
    });
    currencyFormatters.set(currencyCode, formatter);
  }
  return formatter;
}

/**
 * Formatea un importe almacenado en centavos (bigint en base de datos) a moneda.
 * Los importes nunca se calculan en el cliente: provienen del servidor (ADR-005).
 */
export function formatCents(amountCents: number, currencyCode = "ARS") {
  return getFormatter(currencyCode).format(amountCents / 100);
}

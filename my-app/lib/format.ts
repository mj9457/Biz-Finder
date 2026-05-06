const numberFormatter = new Intl.NumberFormat("ko-KR");

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatEmployees(value: number) {
  return `${formatNumber(value)}명`;
}

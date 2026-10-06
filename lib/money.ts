// Toate sumele sunt în bani (întregi), ca să evităm erorile de rotunjire.
const fmt = new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatLei(bani: number): string {
  return `${fmt.format(bani / 100)} lei`;
}

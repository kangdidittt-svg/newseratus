export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

export const USD_TO_IDR_RATE = 16000;

export function usdToIdr(usd?: number | string | null): string {
  const num = typeof usd === 'string' ? parseFloat(usd) : (usd ?? 0);
  const amount = isNaN(num) ? 0 : num;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount * USD_TO_IDR_RATE);
}

export function normalizeClientName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
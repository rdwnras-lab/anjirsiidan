import { clsx } from 'clsx';
export const cn = (...i) => clsx(i);

export function formatIDR(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export function generateOrderId() {
  const d = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const r = Math.random().toString(36).toUpperCase().slice(2,7);
  return `VCH-${d}-${r}`;
}

// Pakasir QRIS fee ~0.7%
export function calculateFee(amount) {
  const fee = Math.ceil(amount * 0.007);
  return { base: amount, fee, total: amount + fee };
}

export const truncate = (s, n=60) => s?.length > n ? s.slice(0, n-3)+'...' : (s||'');

export function timeAgo(d) {
  const mins = Math.floor((Date.now() - new Date(d)) / 60000);
  if (mins < 1)  return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins/60);
  if (hrs < 24)  return `${hrs} jam lalu`;
  return `${Math.floor(hrs/24)} hari lalu`;
}

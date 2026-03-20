import { clsx } from 'clsx';
export const cn = (...i) => clsx(i);

export function formatIDR(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export function generateOrderId(itemName = '') {
  // Format: VECH-ITEMNAME-RANDOMALPHANUMERIC
  const clean = itemName
    ? itemName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12)
    : 'ORDER';
  const r = Math.random().toString(36).toUpperCase().slice(2, 9) +
            Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `VECH-${clean}-${r}`;
}

// calculateFee hanya dipakai sebagai estimasi di UI sebelum konfirmasi
// Fee sesungguhnya diambil dari response Pakasir API
export function calculateFee(amount) {
  // Pakasir fee: 0.7% dibulatkan ke atas, minimum ~Rp 200
  const fee = Math.max(200, Math.ceil(amount * 0.007));
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
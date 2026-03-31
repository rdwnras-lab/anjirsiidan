import { supabaseAdmin } from './supabase';

const BASE = 'https://app.pakasir.com';

async function getConfig() {
  // Coba ambil dari DB, fallback ke env
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .in('key', ['pakasir_slug', 'pakasir_key']);
    const map = {};
    for (const r of data || []) map[r.key] = r.value;
    return {
      slug:   map.pakasir_slug || process.env.PAKASIR_PROJECT_SLUG || '',
      apiKey: map.pakasir_key  || process.env.PAKASIR_API_KEY      || '',
    };
  } catch {
    return {
      slug:   process.env.PAKASIR_PROJECT_SLUG || '',
      apiKey: process.env.PAKASIR_API_KEY      || '',
    };
  }
}

export async function createQrisPayment({ amount, orderId, customerName }) {
  const { slug, apiKey } = await getConfig();
  const res = await fetch(`${BASE}/api/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project:       slug,
      api_key:       apiKey,
      amount:        amount,
      order_id:      orderId,
      customer_name: customerName || 'Customer',
    }),
  });
  if (!res.ok) throw new Error(`Pakasir HTTP ${res.status}`);
  return res.json();
}

export async function getPaymentStatus({ orderId, amount }) {
  const { slug, apiKey } = await getConfig();
  const res = await fetch(`${BASE}/api/payment/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project:  slug,
      api_key:  apiKey,
      order_id: orderId,
      amount:   amount,
    }),
  });
  if (!res.ok) throw new Error(`Pakasir HTTP ${res.status}`);
  return res.json();
}

export async function cancelPayment({ orderId }) {
  const { slug, apiKey } = await getConfig();
  const res = await fetch(`${BASE}/api/payment/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project:  slug,
      api_key:  apiKey,
      order_id: orderId,
    }),
  });
  if (!res.ok) throw new Error(`Pakasir HTTP ${res.status}`);
  return res.json();
}
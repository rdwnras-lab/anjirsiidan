// Pakasir QRIS Integration
// API Docs: https://pakasir.com/p/docs

const BASE = 'https://app.pakasir.com';

export async function createQrisPayment({ orderId, amount }) {
  const res = await fetch(`${BASE}/api/transactioncreate/qris`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: process.env.PAKASIR_PROJECT_SLUG,
      order_id: orderId,
      amount,
      api_key: process.env.PAKASIR_API_KEY,
    }),
  });
  const data = await res.json();
  if (!data?.payment) throw new Error('Pakasir error: ' + JSON.stringify(data));
  // Returns: { amount, fee, total_payment, payment_number (QR string), expired_at }
  return data.payment;
}

export async function getPaymentStatus({ orderId, amount }) {
  const qs = new URLSearchParams({
    project: process.env.PAKASIR_PROJECT_SLUG,
    order_id: orderId,
    amount: String(amount),
    api_key: process.env.PAKASIR_API_KEY,
  });
  const res = await fetch(`${BASE}/api/transactiondetail?${qs}`);
  const data = await res.json();
  return data?.transaction || null;
  // Returns: { status: 'completed'|'pending'|'failed', completed_at }
}

export async function cancelPayment({ orderId, amount }) {
  const res = await fetch(`${BASE}/api/transactioncancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: process.env.PAKASIR_PROJECT_SLUG,
      order_id: orderId,
      amount,
      api_key: process.env.PAKASIR_API_KEY,
    }),
  });
  return res.json();
}

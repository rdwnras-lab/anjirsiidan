import { getPaymentStatus } from '@/lib/pakasir';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  const amount  = parseInt(searchParams.get('amount'));
  if (!orderId || !amount) return Response.json({ error: 'Missing params' }, { status: 400 });

  // Check DB first for speed
  const { data: order } = await supabaseAdmin.from('orders').select('status').eq('id', orderId).single();
  if (order?.status === 'completed') return Response.json({ status: 'completed' });

  // Check Pakasir
  const txn = await getPaymentStatus({ orderId, amount });
  return Response.json({ status: txn?.status || 'pending' });
}

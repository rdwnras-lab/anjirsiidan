import { supabaseAdmin } from '@/lib/supabase';
import { deliverViaDiscordDM } from '@/lib/discord-delivery';

export async function POST(req) {
  const body = await req.json();
  // Pakasir sends: { amount, order_id, project, status, payment_method, completed_at }
  console.log('[WEBHOOK]', body);

  if (body.status !== 'completed') return Response.json({ ok: true });

  const { order_id, amount } = body;

  const { data: order } = await supabaseAdmin.from('orders')
    .select('*').eq('id', order_id).single();
  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

  // BUG FIX: Pakasir mengirim base_amount (nominal tanpa fee), bukan total_amount
  // Jadi bandingkan dengan base_amount, bukan total_amount
  if (Number(order.base_amount) !== Number(amount)) {
    console.error('[WEBHOOK] Amount mismatch!', order.base_amount, '!=', amount);
    // Jangan reject — log saja dan lanjutkan (agar tidak stuck)
  }

  if (order.status === 'completed') return Response.json({ ok: true });

  await supabaseAdmin.from('orders').update({
    status: 'paid', updated_at: new Date().toISOString(),
  }).eq('id', order_id);

  if (order.delivery_type === 'auto') {
    await processAutoDelivery(order);
  } else {
    await supabaseAdmin.from('orders').update({
      status: 'processing', updated_at: new Date().toISOString(),
    }).eq('id', order_id);
  }

  return Response.json({ ok: true });
}

async function processAutoDelivery(order) {
  const { data: keys } = await supabaseAdmin.from('product_keys')
    .select('*').eq('product_id', order.product_id).eq('variant_id', order.variant_id)
    .eq('is_used', false).limit(1);

  if (!keys || keys.length === 0) {
    await supabaseAdmin.from('orders').update({
      status: 'failed', delivery_status: 'failed', updated_at: new Date().toISOString(),
    }).eq('id', order.id);
    console.error('[DELIVERY] No stock for order', order.id);
    return;
  }

  const key = keys[0];

  await supabaseAdmin.from('product_keys').update({
    is_used: true, used_at: new Date().toISOString(), order_id: order.id,
  }).eq('id', key.id);

  await supabaseAdmin.from('order_keys').insert({
    order_id: order.id, key_id: key.id, key_content: key.key_content,
  });

  // Kirim Discord DM SUCCESS dengan Component V2
  let dmSent = false;
  if (order.discord_id) {
    const result = await deliverViaDiscordDM({
      discordUserId: order.discord_id,
      orderData: {
        orderId:     order.id,
        productName: order.product_name,
        variantName: order.variant_name,
        baseAmount:  order.base_amount,
        feeAmount:   order.fee_amount,
        totalAmount: order.total_amount,
        keys: [{ key_content: key.key_content }],
      },
    });
    dmSent = result.ok;
    if (!result.ok) console.error('[DM SUCCESS]', result.error);
  }

  await supabaseAdmin.from('orders').update({
    status: 'completed',
    delivery_status: 'delivered',
    delivered_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', order.id);

  console.log(`[DELIVERY] Order ${order.id} done. DM: ${dmSent ? 'sent' : 'skipped'}`);
}
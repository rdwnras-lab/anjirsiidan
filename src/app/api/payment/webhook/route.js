import { supabaseAdmin } from '@/lib/supabase';
import { deliverViaDiscordDM } from '@/lib/discord-delivery';

export async function POST(req) {
  const body = await req.json();
  // Pakasir sends: { amount, order_id, project, status, payment_method, completed_at }
  console.log('[WEBHOOK]', body);

  if (body.status !== 'completed') return Response.json({ ok: true });

  const { order_id, amount } = body;

  // Get order from DB
  const { data: order } = await supabaseAdmin.from('orders')
    .select('*').eq('id', order_id).single();
  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

  // Verify amount matches
  if (order.total_amount !== amount) {
    console.error('[WEBHOOK] Amount mismatch!', order.total_amount, '!=', amount);
    return Response.json({ error: 'Amount mismatch' }, { status: 400 });
  }

  if (order.status === 'completed') return Response.json({ ok: true }); // already processed

  // Mark order as paid
  await supabaseAdmin.from('orders').update({
    status: 'paid', updated_at: new Date().toISOString()
  }).eq('id', order_id);

  // Auto delivery
  if (order.delivery_type === 'auto') {
    await processAutoDelivery(order);
  } else {
    // Manual: just mark as paid, admin processes
    await supabaseAdmin.from('orders').update({
      status: 'processing', updated_at: new Date().toISOString()
    }).eq('id', order_id);
  }

  return Response.json({ ok: true });
}

async function processAutoDelivery(order) {
  // Get an unused key for this variant
  const { data: keys } = await supabaseAdmin.from('product_keys')
    .select('*').eq('product_id', order.product_id).eq('variant_id', order.variant_id)
    .eq('is_used', false).limit(1);

  if (!keys || keys.length === 0) {
    // No stock! Mark as failed
    await supabaseAdmin.from('orders').update({
      status: 'failed', delivery_status: 'failed', updated_at: new Date().toISOString()
    }).eq('id', order.id);
    console.error('[DELIVERY] No stock for order', order.id);
    return;
  }

  const key = keys[0];

  // Mark key as used
  await supabaseAdmin.from('product_keys').update({
    is_used: true, used_at: new Date().toISOString(), order_id: order.id
  }).eq('id', key.id);

  // Save to order_keys
  await supabaseAdmin.from('order_keys').insert({
    order_id: order.id, key_id: key.id, key_content: key.key_content
  });

  // Send Discord DM if user has Discord ID
  let dmSent = false;
  if (order.discord_id) {
    const result = await deliverViaDiscordDM({
      discordUserId: order.discord_id,
      orderData: {
        orderId:     order.id,
        productName: order.product_name,
        variantName: order.variant_name,
        keys: [{ key_content: key.key_content }],
        storeName:   process.env.NEXT_PUBLIC_STORE_NAME,
      }
    });
    dmSent = result.ok;
  }

  // Mark order as completed
  await supabaseAdmin.from('orders').update({
    status: 'completed',
    delivery_status: 'delivered',
    delivered_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', order.id);

  console.log(`[DELIVERY] Order ${order.id} completed. DM: ${dmSent ? 'sent' : 'failed'}`);
}

import { supabaseAdmin } from '@/lib/supabase';
import { deliverViaDiscordDM, logTransactionToChannel } from '@/lib/discord-delivery';
import { checkAndUpgradeTier } from '@/lib/tier-upgrade';

export async function POST(req) {
  const body = await req.json();
  console.log('[WEBHOOK]', body);

  if (body.status !== 'completed') return Response.json({ ok: true });

  const { order_id } = body;

  const { data: order } = await supabaseAdmin.from('orders')
    .select('*').eq('id', order_id).single();
  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });
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

export async function processAutoDelivery(order) {
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

  // DM success ke user
  let dmSent = false;
  if (order.discord_id) {
    const result = await deliverViaDiscordDM({
      discordUserId: order.discord_id,
      orderData: {
        orderId:      order.id,
        productName:  order.product_name,
        variantName:  order.variant_name,
        baseAmount:   order.base_amount,
        deliveryType: order.delivery_type,
        qty:          order.quantity || 1,
        feeAmount:   order.fee_amount,
        totalAmount: order.total_amount,
        keys:        [{ key_content: key.key_content }],
      },
    });
    dmSent = result.ok;
  }

  await supabaseAdmin.from('orders').update({
    status: 'completed', delivery_status: 'delivered',
    delivered_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq('id', order.id);

  // Upgrade tier user berdasarkan total belanja
  if (order.discord_id) {
    checkAndUpgradeTier(order.discord_id, order.total_amount)
      .catch(e => console.error('[TIER]', e.message));
  }

  // Hitung total transaksi sukses untuk nomor urut
  const { count } = await supabaseAdmin.from('orders')
    .select('*', { count: 'exact', head: true }).eq('status', 'completed');

  await logTransactionToChannel({
    orderData: {
      productName:  order.product_name,
      variantName:  order.variant_name,
      baseAmount:   order.base_amount,
      feeAmount:    order.fee_amount,
      totalAmount:  order.total_amount,
      deliveryType: order.delivery_type,
      discordUserId: order.discord_id,
    },
    transactionNumber: count || 1,
  }).catch(e => console.error('[LOG TRANS]', e.message));

  console.log(`[DELIVERY] Order ${order.id} done. DM: ${dmSent ? 'sent' : 'skipped'}`);
}
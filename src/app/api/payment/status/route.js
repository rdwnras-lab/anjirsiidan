import { getPaymentStatus } from '@/lib/pakasir';
import { supabaseAdmin } from '@/lib/supabase';
import { deliverViaDiscordDM } from '@/lib/discord-delivery';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  if (!orderId) return Response.json({ error: 'Missing orderId' }, { status: 400 });

  const { data: order } = await supabaseAdmin
    .from('orders').select('*').eq('id', orderId).single();
  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

  if (order.status === 'completed') return Response.json({ status: 'completed' });

  // Query Pakasir dengan base_amount (nominal yang dikirim saat create, tanpa fee)
  const txn = await getPaymentStatus({ orderId, amount: order.base_amount });

  if (txn?.status === 'completed') {
    if (order.status !== 'completed') {
      await supabaseAdmin.from('orders').update({
        status: 'paid', updated_at: new Date().toISOString(),
      }).eq('id', orderId);

      if (order.delivery_type === 'auto') {
        await processAutoDelivery(order);
      } else {
        await supabaseAdmin.from('orders').update({
          status: 'completed', updated_at: new Date().toISOString(),
        }).eq('id', orderId);
      }
    }
    return Response.json({ status: 'completed' });
  }

  return Response.json({ status: txn?.status || 'pending' });
}

async function processAutoDelivery(order) {
  // Race condition guard
  const { data: fresh } = await supabaseAdmin
    .from('orders').select('status').eq('id', order.id).single();
  if (fresh?.status === 'completed') return;

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

  // Kirim Discord DM SUCCESS
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

  console.log(`[DELIVERY] Order ${order.id} done via poll. DM: ${dmSent ? 'sent' : 'skipped'}`);
}
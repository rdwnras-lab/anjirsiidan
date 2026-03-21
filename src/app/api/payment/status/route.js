import { getPaymentStatus } from '@/lib/pakasir';
import { supabaseAdmin } from '@/lib/supabase';
import { deliverViaDiscordDM, logTransactionToChannel } from '@/lib/discord-delivery';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  if (!orderId) return Response.json({ error: 'Missing orderId' }, { status: 400 });

  const { data: order } = await supabaseAdmin
    .from('orders').select('*').eq('id', orderId).single();
  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

  if (order.status === 'completed') return Response.json({ status: 'completed' });

  const txn = await getPaymentStatus({ orderId, amount: order.base_amount });

  if (txn?.status === 'completed' && order.status !== 'completed') {
    await supabaseAdmin.from('orders').update({
      status: 'paid', updated_at: new Date().toISOString(),
    }).eq('id', orderId);

    if (order.delivery_type === 'auto') {
      await processAutoDelivery(order);
    } else {
      await supabaseAdmin.from('orders').update({
        status: 'completed', updated_at: new Date().toISOString(),
      }).eq('id', orderId);

      // Log transaksi manual
      const { count } = await supabaseAdmin.from('orders')
        .select('*', { count: 'exact', head: true }).eq('status', 'completed');
      logTransactionToChannel({
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
    }
    return Response.json({ status: 'completed' });
  }

  return Response.json({ status: txn?.status || 'pending' });
}

async function processAutoDelivery(order) {
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
    return;
  }

  const key = keys[0];
  await supabaseAdmin.from('product_keys').update({
    is_used: true, used_at: new Date().toISOString(), order_id: order.id,
  }).eq('id', key.id);

  await supabaseAdmin.from('order_keys').insert({
    order_id: order.id, key_id: key.id, key_content: key.key_content,
  });

  if (order.discord_id) {
    await deliverViaDiscordDM({
      discordUserId: order.discord_id,
      orderData: {
        orderId:      order.id,
        productName:  order.product_name,
        variantName:  order.variant_name,
        baseAmount:   order.base_amount,
        feeAmount:    order.fee_amount,
        totalAmount:  order.total_amount,
        deliveryType: order.delivery_type,
        qty:          order.quantity || 1,
        keys:         [{ key_content: key.key_content }],
      },
    }).catch(e => console.error('[DM SUCCESS]', e.message));
  }

  await supabaseAdmin.from('orders').update({
    status: 'completed', delivery_status: 'delivered',
    delivered_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq('id', order.id);

  const { count } = await supabaseAdmin.from('orders')
    .select('*', { count: 'exact', head: true }).eq('status', 'completed');

  logTransactionToChannel({
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
}
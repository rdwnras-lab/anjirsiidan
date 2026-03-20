import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { deliverViaDiscordDM, logTransactionToChannel } from '@/lib/discord-delivery';

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin')
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { status } = await req.json();
  const now = new Date().toISOString();

  // Hanya update kolom yang pasti ada di DB
  const updateData = { status, updated_at: now };
  // delivery_status & delivered_at: update hanya kalau kolom ada (no-op kalau tidak)
  try {
    const extra = {};
    if (status === 'completed') { extra.delivery_status = 'delivered'; extra.delivered_at = now; }
    if (status === 'cancelled')  { extra.delivery_status = 'cancelled'; }
    if (Object.keys(extra).length) {
      await supabaseAdmin.from('orders').update(extra).eq('id', params.id);
    }
  } catch {}

  await supabaseAdmin.from('orders')
    .update(updateData)
    .eq('id', params.id);

  // Jika admin selesaikan order → kirim DM + log transaksi
  if (status === 'completed') {
    const { data: order } = await supabaseAdmin
      .from('orders').select('*').eq('id', params.id).single();

    if (order?.discord_id) {
      deliverViaDiscordDM({
        discordUserId: order.discord_id,
        orderData: {
          orderId:     order.id,
          productName: order.product_name,
          variantName: order.variant_name,
          baseAmount:  order.base_amount,
          feeAmount:   order.fee_amount,
          totalAmount: order.total_amount,
          keys:        [],
        },
      }).catch(e => console.error('[DM SUCCESS manual]', e.message));
    }

    if (order) {
      const { count } = await supabaseAdmin.from('orders')
        .select('*', { count: 'exact', head: true }).eq('status', 'completed');
      logTransactionToChannel({
        orderData: {
          productName:   order.product_name,
          variantName:   order.variant_name,
          baseAmount:    order.base_amount,
          feeAmount:     order.fee_amount,
          totalAmount:   order.total_amount,
          deliveryType:  order.delivery_type,
          discordUserId: order.discord_id,
        },
        transactionNumber: count || 1,
      }).catch(e => console.error('[LOG TRANS manual]', e.message));
    }
  }

  return Response.json({ ok: true });
}
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateOrderId, calculateFee } from '@/lib/utils';
import { createQrisPayment } from '@/lib/pakasir';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const body    = await req.json();
  const { productId, variantId, formData, customerName, customerWhatsapp, tierPrice } = body;

  const { data: product } = await supabaseAdmin.from('products')
    .select('*, product_variants(*)').eq('id', productId).single();
  if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });

  const variant = product.product_variants?.find(v => v.id === variantId);
  if (!variant) return Response.json({ error: 'Variant not found' }, { status: 404 });

  const isAuto = product.delivery_type === 'auto';

  if (isAuto && !session?.user?.discordId)
    return Response.json({ error: 'Login Discord diperlukan untuk produk otomatis.' }, { status: 401 });

  if (isAuto) {
    const { count } = await supabaseAdmin.from('product_keys')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId).eq('variant_id', variantId).eq('is_used', false);
    if (!count || count < 1)
      return Response.json({ error: 'Stok habis untuk varian ini.' }, { status: 400 });
  }

  const orderId   = generateOrderId();
  const basePrice = tierPrice || variant.price;

  let baseAmt, fee, total, qrString = null, expiredAt = null;

  if (isAuto) {
    const calc = calculateFee(basePrice);
    baseAmt = calc.base;
    fee     = calc.fee;
    total   = calc.total;
    try {
      const payment = await createQrisPayment({ orderId, amount: total });
      qrString  = payment.payment_number;
      expiredAt = payment.expired_at;
    } catch (e) {
      console.error('[PAKASIR]', e.message);
      return Response.json({ error: 'Gagal membuat pembayaran. Coba lagi.' }, { status: 500 });
    }
  } else {
    // Manual: tidak ada fee QRIS
    baseAmt = basePrice;
    fee     = 0;
    total   = basePrice;
  }

  // Ambil UUID user dari tabel users (bukan discord snowflake)
  let userUUID = null;
  if (session?.user?.discordId) {
    const { data: u } = await supabaseAdmin
      .from('users').select('id').eq('id', session.user.discordId).single();
    userUUID = u?.id || null;
  }

  const { error: dbErr } = await supabaseAdmin.from('orders').insert({
    id:                orderId,
    user_id:           userUUID,
    discord_id:        session?.user?.discordId || null,
    product_id:        productId,
    variant_id:        variantId,
    product_name:      product.name,
    variant_name:      variant.name,
    delivery_type:     product.delivery_type,
    customer_name:     customerName || session?.user?.name || null,
    customer_whatsapp: customerWhatsapp || null,
    form_data:         formData || {},
    base_amount:       baseAmt,
    fee_amount:        fee,
    total_amount:      total,
    status:            'pending',
    payment_qr:        qrString,
    payment_expired_at: expiredAt,
  });

  if (dbErr) {
    console.error('[ORDER DB]', dbErr.message);
    return Response.json({ error: 'Gagal menyimpan pesanan.' }, { status: 500 });
  }

  return Response.json({ orderId });
}

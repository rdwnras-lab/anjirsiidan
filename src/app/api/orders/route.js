import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateOrderId, calculateFee } from '@/lib/utils';
import { createQrisPayment } from '@/lib/pakasir';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const body    = await req.json();
  const { productId, variantId, formData, customerName, customerWhatsapp } = body;

  // Get product + variant
  const { data: product } = await supabaseAdmin.from('products')
    .select('*, product_variants(*)').eq('id', productId).single();
  if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });

  const variant = product.product_variants?.find(v => v.id === variantId);
  if (!variant) return Response.json({ error: 'Variant not found' }, { status: 404 });

  const isAuto = product.delivery_type === 'auto';

  // Auto products require Discord login
  if (isAuto && !session?.user?.discordId)
    return Response.json({ error: 'Login Discord diperlukan untuk produk otomatis.' }, { status: 401 });

  // Check stock for auto products
  if (isAuto) {
    const { count } = await supabaseAdmin.from('product_keys')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId).eq('variant_id', variantId).eq('is_used', false);
    if (!count || count < 1)
      return Response.json({ error: 'Stok habis untuk varian ini.' }, { status: 400 });
  }

  const orderId  = generateOrderId();
  const { base: baseAmt, fee, total } = calculateFee(variant.price);

  // Create QRIS payment via Pakasir
  let qrString = null, expiredAt = null;
  try {
    const payment = await createQrisPayment({ orderId, amount: total });
    qrString  = payment.payment_number;
    expiredAt = payment.expired_at;
  } catch (e) {
    console.error('[PAKASIR]', e.message);
    return Response.json({ error: 'Gagal membuat pembayaran. Coba lagi.' }, { status: 500 });
  }

  // Save order to DB
  const { error: dbErr } = await supabaseAdmin.from('orders').insert({
    id:               orderId,
    user_id:          session?.user?.discordId ? (await supabaseAdmin.from('users').select('id').eq('discord_id', session.user.discordId).single())?.data?.id : null,
    discord_id:       session?.user?.discordId || null,
    product_id:       productId,
    variant_id:       variantId,
    product_name:     product.name,
    variant_name:     variant.name,
    delivery_type:    product.delivery_type,
    customer_name:    customerName || session?.user?.name || null,
    customer_whatsapp: customerWhatsapp || null,
    form_data:        formData || {},
    base_amount:      baseAmt,
    fee_amount:       fee,
    total_amount:     total,
    status:           'pending',
    payment_qr:       qrString,
    payment_expired_at: expiredAt,
  });

  if (dbErr) {
    console.error('[ORDER DB]', dbErr.message);
    return Response.json({ error: 'Gagal menyimpan pesanan.' }, { status: 500 });
  }

  return Response.json({ orderId });
}

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateOrderId } from '@/lib/utils';
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

  const orderId   = generateOrderId(variant.name);
  const basePrice = tierPrice || variant.price;

  let baseAmt, fee, total, qrString = null, expiredAt = null;

  if (isAuto) {
    try {
      const payment = await createQrisPayment({ orderId, amount: basePrice });
      qrString = payment.payment_number;
      baseAmt  = payment.amount || basePrice;
      fee      = payment.fee || 0;
      total    = payment.total_payment || (basePrice + fee);

      // Pakasir expired_at bisa berupa:
      // - Unix timestamp absolut (detik) misal: 1742000000  (10 digit, > tahun 2001)
      // - Durasi relatif (detik)         misal: 1800        (= 30 menit dari sekarang)
      // - ISO string                     misal: "2026-03-20T11:00:00Z"
      // Angka < 86400 (1 hari) dianggap durasi relatif, bukan timestamp absolut.
      const rawExp = payment.expired_at;
      if (rawExp !== null && rawExp !== undefined && rawExp !== '') {
        const num = Number(rawExp);
        let parsed;
        if (!isNaN(num)) {
          parsed = num < 86400
            ? new Date(Date.now() + num * 1000)   // durasi relatif dalam detik
            : new Date(num * 1000);                // Unix timestamp absolut
        } else {
          parsed = new Date(String(rawExp));        // ISO string
        }
        expiredAt = parsed && !isNaN(parsed.getTime())
          ? parsed.toISOString()
          : new Date(Date.now() + 30 * 60 * 1000).toISOString();
      } else {
        expiredAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      }
    } catch (e) {
      console.error('[PAKASIR]', e.message);
      return Response.json({ error: 'Gagal membuat pembayaran. Coba lagi.' }, { status: 500 });
    }
  } else {
    baseAmt = basePrice;
    fee     = 0;
    total   = basePrice;
  }

  let userUUID = null;
  if (session?.user?.discordId) {
    const { data: u } = await supabaseAdmin
      .from('users').select('id')
      .eq('discord_id', session.user.discordId).single();
    userUUID = u?.id || null;
  }

  const { error: dbErr } = await supabaseAdmin.from('orders').insert({
    id:                 orderId,
    user_id:            userUUID,
    discord_id:         session?.user?.discordId || null,
    product_id:         productId,
    variant_id:         variantId,
    product_name:       product.name,
    variant_name:       variant.name,
    delivery_type:      product.delivery_type,
    customer_name:      customerName || session?.user?.name || null,
    customer_whatsapp:  customerWhatsapp || null,
    form_data:          formData || {},
    base_amount:        baseAmt,
    fee_amount:         fee,
    total_amount:       total,
    status:             'pending',
    payment_qr:         qrString,
    payment_expired_at: expiredAt,
  });

  if (dbErr) {
    console.error('[ORDER DB]', dbErr.message);
    return Response.json({ error: 'Gagal menyimpan pesanan.' }, { status: 500 });
  }

  return Response.json({ orderId });
}
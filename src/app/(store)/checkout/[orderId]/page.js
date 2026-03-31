import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import CheckoutClient from './CheckoutClient';

export const metadata = { title: 'Pembayaran' };

export default async function CheckoutPage({ params }) {
  const [{ data: order }, { data: qrisSetting }] = await Promise.all([
    supabaseAdmin.from('orders')
      .select('*, products(thumbnail, banner_image), payment_methods(*)')
      .eq('id', params.orderId)
      .single(),
    supabaseAdmin.from('site_settings').select('value').eq('key', 'qris_url').single(),
  ]);

  if (!order) notFound();

  // Jika sudah completed, fetch juga order_keys untuk tampilkan key (produk otomatis)
  if (order.status === 'completed') {
    const { data: orderKeys } = await supabaseAdmin
      .from('order_keys')
      .select('key_content')
      .eq('order_id', params.orderId);

    const orderWithQr = { ...order, qris_url: qrisSetting?.value || null };
    return (
      <CheckoutClient
        order={orderWithQr}
        initialCompleted={true}
        orderKeys={orderKeys || []}
      />
    );
  }

  const orderWithQr = { ...order, qris_url: qrisSetting?.value || null };
  return <CheckoutClient order={orderWithQr} initialCompleted={false} orderKeys={[]} />;
}
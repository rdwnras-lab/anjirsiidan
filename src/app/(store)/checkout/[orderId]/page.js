import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import CheckoutClient from './CheckoutClient';

export const metadata = { title: 'Pembayaran' };

export default async function CheckoutPage({ params }) {
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*, products(thumbnail, banner_image), payment_methods(*)')
    .eq('id', params.orderId)
    .single();

  if (!order) notFound();

  // Jika sudah completed, fetch juga order_keys untuk tampilkan key (produk otomatis)
  if (order.status === 'completed') {
    const { data: orderKeys } = await supabaseAdmin
      .from('order_keys')
      .select('key_content')
      .eq('order_id', params.orderId);

    return (
      <CheckoutClient
        order={order}
        initialCompleted={true}
        orderKeys={orderKeys || []}
      />
    );
  }

  return <CheckoutClient order={order} initialCompleted={false} orderKeys={[]} />;
}
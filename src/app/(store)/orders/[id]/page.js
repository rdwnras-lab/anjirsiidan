import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { formatIDR } from '@/lib/utils';
import Link from 'next/link';
import OrderDetailClient from './OrderDetailClient';

export const metadata = { title: 'Detail Pesanan' };

export default async function OrderDetailPage({ params }) {
  const session = await getServerSession(authOptions);

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*, products(thumbnail), order_keys(key_content)')
    .eq('id', params.id)
    .single();

  if (!order) notFound();

  const canSeeKeys =
    order.delivery_type === 'manual' ||
    (session?.user?.discordId && order.discord_id === session.user.discordId);

  return (
    <OrderDetailClient
      order={order}
      canSeeKeys={canSeeKeys}
    />
  );
}
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import TopupClient from './TopupClient';

export const metadata = { title: 'Topup Saldo' };

export default async function TopupPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.discordId) redirect('/login');

  const [{ data: methods }, { data: user }, { data: history }] = await Promise.all([
    supabaseAdmin.from('payment_methods').select('*').eq('is_active', true).order('sort_order'),
    supabaseAdmin.from('users').select('balance').eq('discord_id', session.user.discordId).single(),
    supabaseAdmin.from('topup_requests')
      .select('*')
      .eq('discord_id', session.user.discordId)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return (
    <TopupClient
      paymentMethods={methods || []}
      currentBalance={user?.balance || 0}
      history={history || []}
    />
  );
}
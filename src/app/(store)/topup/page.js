export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import TopupClient from './TopupClient';

export const metadata = { title: 'Topup Saldo' };

export default async function TopupPage() {
  const session = await getServerSession(authOptions);
  const discordId   = session?.user?.discordId || null;
  const googleEmail = session?.user?.email || null;

  // Must be logged in (Discord or Google)
  if (!discordId && !googleEmail) redirect('/');

  const userQuery = discordId
    ? supabaseAdmin.from('users').select('balance').eq('discord_id', discordId).single()
    : supabaseAdmin.from('users').select('balance').eq('google_email', googleEmail).single();

  const [{ data: methods }, { data: user }, { data: history }] = await Promise.all([
    supabaseAdmin.from('payment_methods').select('*').eq('is_active', true).order('sort_order'),
    userQuery,
    supabaseAdmin.from('topup_requests')
      .select('*')
      .or(discordId ? 'discord_id.eq.' + discordId : 'user_email.eq.' + googleEmail)
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
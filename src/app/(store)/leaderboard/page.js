export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import LeaderboardClient from './LeaderboardClient';

async function build(from) {
  const { data } = await supabaseAdmin
    .from('orders')
    .select('discord_id, customer_name, user_name, total_amount')
    .eq('status', 'completed')
    .gte('created_at', from.toISOString());
  if (!data) return [];
  const map = {};
  for (const o of data) {
    const uid  = o.discord_id;
    if (!uid) continue;
    const name = o.user_name || o.customer_name || 'User';
    if (!map[uid]) map[uid] = { id: uid, name, total: 0, count: 0 };
    map[uid].total += o.total_amount || 0;
    map[uid].count += 1;
  }
  return Object.values(map).sort((a,b) => b.total - a.total).slice(0, 10);
}

export default async function LeaderboardPage() {
  const now   = new Date();
  const today = new Date(now); today.setHours(0,0,0,0);
  const week  = new Date(now); week.setDate(now.getDate() - now.getDay()); week.setHours(0,0,0,0);
  const month = new Date(now.getFullYear(), now.getMonth(), 1);

  const [daily, weekly, monthly] = await Promise.all([
    build(today), build(week), build(month)
  ]);

  return <LeaderboardClient daily={daily} weekly={weekly} monthly={monthly} />;
}

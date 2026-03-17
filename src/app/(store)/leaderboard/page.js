export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import LeaderboardClient from './LeaderboardClient';

async function getAllData() {
  const now   = new Date();
  const today = new Date(now); today.setHours(0,0,0,0);
  const week  = new Date(now); week.setDate(now.getDate() - now.getDay()); week.setHours(0,0,0,0);
  const month = new Date(now.getFullYear(), now.getMonth(), 1);

  const build = async (from) => {
    const { data } = await supabaseAdmin
      .from('orders')
      .select('user_id, user_name, user_avatar, total_amount')
      .eq('status', 'completed')
      .gte('created_at', from.toISOString());
    if (!data) return [];
    const map = {};
    for (const o of data) {
      if (!o.user_id) continue;
      if (!map[o.user_id]) map[o.user_id] = { id: o.user_id, name: o.user_name || 'User', avatar: o.user_avatar, total: 0 };
      map[o.user_id].total += o.total_amount || 0;
    }
    return Object.values(map).sort((a,b) => b.total - a.total).slice(0, 10);
  };

  const [daily, weekly, monthly] = await Promise.all([build(today), build(week), build(month)]);
  return { daily, weekly, monthly };
}

export default async function LeaderboardPage() {
  const { daily, weekly, monthly } = await getAllData();
  return <LeaderboardClient daily={daily} weekly={weekly} monthly={monthly} />;
}

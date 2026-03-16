import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

function isAdmin(s) { return s?.user?.role === 'admin'; }

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { data } = await supabaseAdmin.from('orders')
    .select('*, order_keys(key_content)')
    .order('created_at', { ascending: false })
    .limit(200);
  return Response.json(data || []);
}

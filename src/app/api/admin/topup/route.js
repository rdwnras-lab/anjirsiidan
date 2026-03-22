import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabaseAdmin
    .from('topup_requests')
    .select('*, payment_methods(provider, account_number)')
    .order('created_at', { ascending: false })
    .limit(100);

  return Response.json(data || []);
}
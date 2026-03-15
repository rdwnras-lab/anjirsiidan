import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { status } = await req.json();
  await supabaseAdmin.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', params.id);
  return Response.json({ ok: true });
}

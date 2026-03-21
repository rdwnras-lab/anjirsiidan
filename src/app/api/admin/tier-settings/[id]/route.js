import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from('tier_settings').update(body).eq('id', params.id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { error } = await supabaseAdmin.from('tier_settings').delete().eq('id', params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
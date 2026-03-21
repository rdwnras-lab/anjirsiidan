import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

function isAdmin(s) { return s?.user?.role === 'admin'; }

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updateData = {};
  if (body.stock !== undefined)        updateData.stock = parseInt(body.stock) || 0;
  if (body.is_available !== undefined) updateData.is_available = body.is_available;
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from('product_variants')
    .update(updateData)
    .eq('id', params.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
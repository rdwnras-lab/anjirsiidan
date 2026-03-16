import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

function isAdmin(s) { return s?.user?.role === 'admin'; }

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { data } = await supabaseAdmin
    .from('products')
    .select('*, product_variants(*), form_fields')
    .eq('id', params.id)
    .single();
  return Response.json(data);
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();

  // If variant_sync included, delete old variants and re-insert
  if (body.variant_sync) {
    const variants = body.variant_sync;
    delete body.variant_sync;
    await supabaseAdmin.from('product_variants').delete().eq('product_id', params.id);
    if (variants.length) {
      await supabaseAdmin.from('product_variants').insert(
        variants.map((v, i) => ({
          product_id: params.id,
          name: v.name,
          price: parseInt(v.price),
          sort_order: i,
        }))
      );
    }
  }

  const { error } = await supabaseAdmin
    .from('products')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  await supabaseAdmin.from('product_variants').delete().eq('product_id', params.id);
  await supabaseAdmin.from('product_keys').delete().eq('product_id', params.id);
  await supabaseAdmin.from('products').delete().eq('id', params.id);
  return Response.json({ ok: true });
}

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

  if (body.variant_sync) {
    const incomingVariants = body.variant_sync;
    delete body.variant_sync;

    // Get existing variants from DB
    const { data: existingVariants } = await supabaseAdmin
      .from('product_variants')
      .select('id, name, price')
      .eq('product_id', params.id);

    const existingIds = (existingVariants || []).map(v => v.id);

    // Determine which variants were in old list but NOT in incoming (deleted)
    // We identify "deleted" variants as those not matched by name+price in the incoming list
    // Strategy: delete all then re-insert ONLY if no keys exist for those variants
    // Otherwise update name/price in place for variants that have keys

    // Build map: existing by index for matching
    const incoming = incomingVariants.map((v, i) => ({
      name: v.name,
      price: parseInt(v.price),
      sort_order: i,
    }));

    if (existingIds.length === 0) {
      // No existing variants — just insert all
      if (incoming.length > 0) {
        const { error: insErr } = await supabaseAdmin.from('product_variants').insert(
          incoming.map(v => ({ ...v, product_id: params.id, stock: v.stock ?? 0 }))
        );
        if (insErr) return Response.json({ error: 'Gagal menyimpan varian: ' + insErr.message }, { status: 500 });
      }
    } else {
      // Smart sync: match existing variants to incoming by position
      // Update existing ones, insert new ones, delete removed ones (only if no keys)
      const maxLen = Math.max(existingIds.length, incoming.length);

      for (let i = 0; i < maxLen; i++) {
        if (i < existingIds.length && i < incoming.length) {
          // Update existing variant in place (safe — keys still reference same variant_id)
          await supabaseAdmin.from('product_variants')
            .update({ name: incoming[i].name, price: incoming[i].price, sort_order: i, stock: incoming[i].stock ?? 0 })
            .eq('id', existingIds[i]);
        } else if (i >= existingIds.length) {
          // New variant — insert
          await supabaseAdmin.from('product_variants').insert({
            product_id: params.id,
            name: incoming[i].name,
            price: incoming[i].price,
            sort_order: i,
          });
        } else {
          // Existing variant removed from list — only delete if no keys reference it
          const { count } = await supabaseAdmin
            .from('product_keys')
            .select('*', { count: 'exact', head: true })
            .eq('variant_id', existingIds[i]);

          if (!count || count === 0) {
            await supabaseAdmin.from('product_variants').delete().eq('id', existingIds[i]);
          }
          // If has keys, keep variant but mark inactive (don't delete)
        }
      }
    }
  }

  // Update product fields
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

  // Get all key IDs first
  const { data: keyRows } = await supabaseAdmin
    .from('product_keys').select('id').eq('product_id', params.id);

  if (keyRows && keyRows.length > 0) {
    const keyIds = keyRows.map(k => k.id);
    await supabaseAdmin.from('order_keys').delete().in('key_id', keyIds);
  }
  await supabaseAdmin.from('product_keys').delete().eq('product_id', params.id);
  await supabaseAdmin.from('product_variants').delete().eq('product_id', params.id);
  await supabaseAdmin.from('products').delete().eq('id', params.id);
  return Response.json({ ok: true });
}
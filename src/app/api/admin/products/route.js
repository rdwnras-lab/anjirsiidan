import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

function isAdmin(s) { return s?.user?.role === 'admin'; }

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { data } = await supabaseAdmin.from('products').select('*, categories(name), product_variants(*), product_keys(id,is_used)').order('created_at', { ascending: false });
  return Response.json(data || []);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { variants, formFields, ...product } = await req.json();

  const { data: prod, error } = await supabaseAdmin.from('products').insert({
    ...product, form_fields: formFields || []
  }).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });

  if (variants?.length) {
    await supabaseAdmin.from('product_variants').insert(
      variants.map((v, i) => ({ product_id: prod.id, name: v.name, price: parseInt(v.price), sort_order: i }))
    );
  }
  return Response.json({ id: prod.id });
}

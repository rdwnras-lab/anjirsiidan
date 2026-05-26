import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

function isAdmin(s) { return s?.user?.role === 'admin'; }

const SPECIAL_CATS = ['website', 'bot', 'template'];

// Helper: get or create category by name
async function getCategoryId(name) {
  const { data } = await supabaseAdmin
    .from('categories').select('id').eq('slug', name).single();
  if (data?.id) return data.id;
  // Create it
  const { data: created } = await supabaseAdmin.from('categories').insert({
    name: name.toUpperCase(), slug: name, icon: name === 'website' ? 'globe' : name === 'bot' ? 'robot' : 'file-code',
    is_active: true, sort_order: 999,
  }).select('id').single();
  return created?.id;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabaseAdmin
    .from('products')
    .select('*, categories(id, name, slug), product_variants(id, name, price, stock)')
    .in('category_id', await getCategoryIds())
    .order('name');

  return Response.json(data || []);
}

async function getCategoryIds() {
  const { data } = await supabaseAdmin
    .from('categories').select('id').in('slug', SPECIAL_CATS);
  return (data || []).map(c => c.id);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, slug, category_slug, product_info, preview_images, preview_video,
          is_active, delivery_type, download_url, variant_sync } = body;

  if (!name || !slug) return Response.json({ error: 'Nama dan slug wajib diisi.' }, { status: 400 });

  const categoryId = await getCategoryId(category_slug || 'website');

  const { data: product, error } = await supabaseAdmin.from('products').insert({
    name, slug, category_id: categoryId,
    product_info, preview_images, preview_video,
    is_active: is_active ?? true,
    delivery_type: delivery_type || 'auto',
    download_url,
    is_best_seller: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select('id').single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Create variants
  if (variant_sync?.length) {
    await supabaseAdmin.from('product_variants').insert(
      variant_sync.map((v, i) => ({
        product_id: product.id, name: v.name,
        price: parseInt(v.price), stock: v.stock ?? 999,
        sort_order: i, is_active: true,
      }))
    );
  }

  return Response.json({ id: product.id });
}
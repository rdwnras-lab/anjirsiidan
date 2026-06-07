import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

function isAdmin(s) { return s?.user?.role === 'admin'; }

const SPECIAL_SLUGS = ['website','bot','template'];

async function getOrCreateCategoryId(slug) {
  const { data } = await supabaseAdmin
    .from('categories').select('id').eq('slug', slug).single();
  if (data?.id) return data.id;
  const { data: created } = await supabaseAdmin.from('categories').insert({
    name: slug.toUpperCase(), slug, is_active: true, sort_order: 99,
  }).select('id').single();
  return created?.id || null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Get all category IDs for special cats
  const { data: cats } = await supabaseAdmin
    .from('categories').select('id').in('slug', SPECIAL_SLUGS);
  const catIds = (cats || []).map(c => c.id);

  if (!catIds.length) return Response.json([]);

  const { data } = await supabaseAdmin
    .from('products')
    .select('id, name, slug, thumbnail, is_active, product_info, preview_images, preview_video, delivery_type, categories(id, name, slug), product_variants(id, name, price, stock, delivery_content)')
    .in('category_id', catIds)
    .order('name');

  return Response.json(data || []);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    name, slug, category_slug, product_info,
    preview_images, preview_video, thumbnail, banner_image,
    is_active, delivery_type, variant_sync,
  } = body;

  if (!name || !slug) return Response.json({ error: 'Nama dan slug wajib diisi.' }, { status: 400 });

  const categoryId = await getOrCreateCategoryId(category_slug || 'website');
  if (!categoryId) return Response.json({ error: 'Kategori tidak ditemukan.' }, { status: 400 });

  const { data: product, error } = await supabaseAdmin.from('products').insert({
    name,
    slug,
    category_id:    categoryId,
    product_info:   product_info || null,
    preview_images: preview_images || [],
    preview_video:  preview_video || null,
    thumbnail:      thumbnail || null,
    banner_image:   banner_image || null,
    is_active:      is_active ?? true,
    delivery_type:  delivery_type || 'auto',
    is_best_seller: false,
    created_at:     new Date().toISOString(),
    updated_at:     new Date().toISOString(),
  }).select('id').single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Insert variants with delivery_content
  if (variant_sync?.length) {
    const { error: varErr } = await supabaseAdmin.from('product_variants').insert(
      variant_sync.map((v, i) => ({
        product_id:       product.id,
        name:             v.name,
        price:            parseInt(v.price) || 0,
        stock:            999,
        delivery_content: v.delivery_content || null,
        sort_order:       i,
        is_active:        true,
      }))
    );
    if (varErr) console.error('[VARIANT INSERT]', varErr.message);
  }

  return Response.json({ id: product.id });
}
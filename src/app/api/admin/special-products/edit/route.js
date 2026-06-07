import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

function isAdmin(s) { return s?.user?.role === 'admin'; }

async function getCategoryId(slug) {
  const { data } = await supabaseAdmin
    .from('categories').select('id').eq('slug', slug).single();
  if (data?.id) return data.id;
  const { data: created } = await supabaseAdmin.from('categories').insert({
    name: slug.toUpperCase(), slug,
    is_active: true, sort_order: 99,
  }).select('id').single();
  return created?.id;
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'ID diperlukan.' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      id, name, slug, is_active, delivery_type, product_info,
      preview_images, preview_video, download_url, banner_image,
      categories(id, name, slug),
      product_variants(id, name, price, stock, delivery_content, sort_order)
    `)
    .eq('id', id).single();

  if (error || !data) return Response.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
  return Response.json(data);
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'ID diperlukan.' }, { status: 400 });

  const body = await req.json();
  const { variant_sync, category_slug, ...productData } = body;

  // Update product fields
  const updateFields = {
    name:           productData.name,
    slug:           productData.slug,
    is_active:      productData.is_active,
    delivery_type:  productData.delivery_type,
    product_info:   productData.product_info,
    preview_images: productData.preview_images,
    preview_video:  productData.preview_video,
    download_url:   productData.download_url,
    banner_image:   productData.banner_image,
    updated_at:     new Date().toISOString(),
  };

  if (category_slug) {
    updateFields.category_id = await getCategoryId(category_slug);
  }

  const { error: prodErr } = await supabaseAdmin
    .from('products').update(updateFields).eq('id', id);

  if (prodErr) return Response.json({ error: prodErr.message }, { status: 500 });

  // Sync variants - delete all then re-insert with delivery_content
  if (variant_sync && variant_sync.length > 0) {
    await supabaseAdmin.from('product_variants').delete().eq('product_id', id);
    
    const { error: varErr } = await supabaseAdmin.from('product_variants').insert(
      variant_sync.map((v, i) => ({
        product_id:       id,
        name:             v.name,
        price:            parseInt(v.price) || 0,
        stock:            v.stock ?? 999,
        delivery_content: v.delivery_content || null,
        sort_order:       i,
        is_active:        true,
      }))
    );

    if (varErr) return Response.json({ error: 'Gagal simpan paket: ' + varErr.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'ID diperlukan.' }, { status: 400 });

  await supabaseAdmin.from('product_variants').delete().eq('product_id', id);
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
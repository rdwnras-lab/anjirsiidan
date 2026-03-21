import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

export async function generateMetadata({ params }) {
  const { data } = await supabaseAdmin.from('products').select('name,description').eq('slug', params.slug).single();
  return { title: data?.name, description: data?.description };
}

export default async function ProductPage({ params }) {
  const { data: product } = await supabaseAdmin.from('products').select(`
    *, banner_image, categories(id, name, slug),
    product_variants(id, name, price, is_active, stock, sort_order),
    product_keys(id, is_used, variant_id)
  `).eq('slug', params.slug).eq('is_active', true).single();

  if (!product) notFound();

  // Stock per variant:
  // - Auto: hitung dari product_keys yang belum dipakai
  // - Manual: pakai kolom stock langsung dari variant
  const stockByVariant = {};
  if (product.delivery_type === 'auto' && product.product_keys) {
    for (const k of product.product_keys) {
      if (!k.is_used) stockByVariant[k.variant_id] = (stockByVariant[k.variant_id] || 0) + 1;
    }
  } else if (product.delivery_type === 'manual' && product.product_variants) {
    for (const v of product.product_variants) {
      stockByVariant[v.id] = v.stock ?? 0;
    }
  }

  const variants = (product.product_variants || [])
    .filter(v => v.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return <ProductDetailClient product={product} variants={variants} stockByVariant={stockByVariant} />;
}
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ProductsClient from './ProductsClient';

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);
  const tier    = (session?.user?.tier || 'member').toLowerCase();

  // Ambil produk + variant
  const { data: prods } = await supabaseAdmin
    .from('products')
    .select('id, name, slug, thumbnail, delivery_type, product_variants(id, name, price, sort_order)')
    .eq('is_active', true)
    .order('sort_order');

  // Ambil tier settings dari DB
  const { data: tierSettings } = await supabaseAdmin
    .from('tier_settings')
    .select('*')
    .eq('is_active', true)
    .order('min_spent', { ascending: true });

  return (
    <ProductsClient
      prods={prods || []}
      tierSettings={tierSettings || []}
      currentTier={tier}
    />
  );
}
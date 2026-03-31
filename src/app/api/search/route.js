import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  if (!q || q.length < 1) return Response.json([]);

  const { data } = await supabaseAdmin
    .from('products')
    .select('id, name, slug, thumbnail, publisher')
    .eq('is_active', true)
    .ilike('name', `%${q}%`)
    .order('name', { ascending: true })
    .limit(8);

  return Response.json(data || []);
}
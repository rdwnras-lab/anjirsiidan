import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  if (!orderId) return Response.json([], { status: 400 });

  const { data } = await supabaseAdmin
    .from('order_keys')
    .select('key_content')
    .eq('order_id', orderId);

  return Response.json(data || []);
}
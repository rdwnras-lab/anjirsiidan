import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 });

  const { data } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('id', id)
    .single();

  if (!data) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ id: data.id });
}
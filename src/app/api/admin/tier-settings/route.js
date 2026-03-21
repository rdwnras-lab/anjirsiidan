import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data } = await supabaseAdmin
    .from('tier_settings')
    .select('*')
    .order('min_spent', { ascending: true });
  return Response.json(data || []);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { data, error } = await supabaseAdmin.from('tier_settings').insert({
    tier_name:  body.tier_name,
    min_spent:  body.min_spent,
    discount:   body.discount,
    color:      body.color || '#fbbf24',
    is_active:  body.is_active ?? true,
  }).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
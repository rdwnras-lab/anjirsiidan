import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data } = await supabaseAdmin
    .from('payment_methods')
    .select('*')
    .order('type').order('sort_order');
  return Response.json(data || []);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabaseAdmin.from('payment_methods').insert({
    type:           body.type,
    provider:       body.provider,
    account_number: body.account_number,
    account_name:   body.account_name,
    logo_url:       body.logo_url || null,
    is_active:      body.is_active ?? true,
    sort_order:     body.sort_order || 0,
  }).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
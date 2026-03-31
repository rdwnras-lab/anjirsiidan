import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

function isAdmin(s) { return s?.user?.role === 'admin'; }

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabaseAdmin
    .from('site_settings').select('key, value').in('key', [
      'pakasir_slug', 'pakasir_key', 'qris_url', 'colors',
    ]);

  const result = {};
  for (const row of data || []) {
    if (row.key === 'colors') {
      try { result.colors = JSON.parse(row.value); } catch { result.colors = {}; }
    } else {
      result[row.key] = row.value;
    }
  }
  // Mask pakasir_key
  if (result.pakasir_key) result.pakasir_key = '••••••••';
  return Response.json(result);
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updates = [];

  if (body.pakasir_slug !== undefined)
    updates.push({ key: 'pakasir_slug', value: body.pakasir_slug });
  if (body.pakasir_key && !body.pakasir_key.includes('•'))
    updates.push({ key: 'pakasir_key', value: body.pakasir_key });
  if (body.qris_url !== undefined)
    updates.push({ key: 'qris_url', value: body.qris_url });
  if (body.colors !== undefined)
    updates.push({ key: 'colors', value: JSON.stringify(body.colors) });

  for (const { key, value } of updates) {
    await supabaseAdmin.from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  }

  return Response.json({ ok: true });
}
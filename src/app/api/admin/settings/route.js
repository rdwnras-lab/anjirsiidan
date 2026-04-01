import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

function isAdmin(s) { return s?.user?.role === 'admin'; }

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('key, value');

  const result = {};
  for (const row of (data || [])) {
    if (row.key === 'colors') {
      try { result.colors = JSON.parse(row.value); } catch { result.colors = {}; }
    } else {
      // Mask API key display
      if (row.key === 'pakasir_key' && row.value) {
        result[row.key] = row.value.slice(0, 4) + '****';
      } else {
        result[row.key] = row.value;
      }
    }
  }
  return Response.json(result);
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const now = new Date().toISOString();

  const upserts = [];

  if (body.pakasir_slug !== undefined)
    upserts.push({ key: 'pakasir_slug', value: String(body.pakasir_slug), updated_at: now });
  // Only update key if not masked
  if (body.pakasir_key && !body.pakasir_key.includes('*'))
    upserts.push({ key: 'pakasir_key', value: String(body.pakasir_key), updated_at: now });
  if (body.qris_url !== undefined)
    upserts.push({ key: 'qris_url', value: String(body.qris_url), updated_at: now });
  if (body.colors !== undefined)
    upserts.push({ key: 'colors', value: JSON.stringify(body.colors), updated_at: now });

  if (upserts.length === 0)
    return Response.json({ error: 'Tidak ada data untuk disimpan.' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert(upserts, { onConflict: 'key' });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
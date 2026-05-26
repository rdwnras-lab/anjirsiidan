import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin')
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file');
  const type = formData.get('type') || 'image'; // 'image' | 'video'

  if (!file) return Response.json({ error: 'File wajib dikirim.' }, { status: 400 });

  const maxSize = type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxSize)
    return Response.json({ error: `Ukuran maksimal ${type === 'video' ? '50MB' : '5MB'}.` }, { status: 400 });

  const ext = file.name?.split('.').pop() || (type === 'video' ? 'mp4' : 'jpg');
  const fileName = `product-media/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = await file.arrayBuffer();

  // Buat bucket jika belum ada
  await supabaseAdmin.storage.createBucket('media', { public: true }).catch(() => {});

  const { error: upErr } = await supabaseAdmin.storage
    .from('media')
    .upload(fileName, buffer, { contentType: file.type || 'application/octet-stream', upsert: false });

  if (upErr) return Response.json({ error: 'Upload gagal: ' + upErr.message }, { status: 500 });

  const { data } = supabaseAdmin.storage.from('media').getPublicUrl(fileName);
  return Response.json({ url: data.publicUrl });
}
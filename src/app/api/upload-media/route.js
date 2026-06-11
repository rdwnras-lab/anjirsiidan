import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const config = {
  api: { bodyParser: false },
};

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin')
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let formData;
  try {
    formData = await req.formData();
  } catch (e) {
    return Response.json({ error: 'Gagal baca data: ' + e.message }, { status: 400 });
  }

  const file = formData.get('file');
  const type = formData.get('type') || 'image';

  if (!file || typeof file === 'string')
    return Response.json({ error: 'File tidak ditemukan.' }, { status: 400 });

  // Size limit: video 200MB, image 10MB
  const maxSize = type === 'video' ? 200 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize)
    return Response.json({ error: 'Ukuran maks ' + (type === 'video' ? '200MB' : '10MB') }, { status: 400 });

  const ext      = (file.name || 'file').split('.').pop() || (type === 'video' ? 'mp4' : 'jpg');
  const fileName = 'product-media/' + Date.now() + '_' + Math.random().toString(36).slice(2) + '.' + ext;

  // Buat bucket jika belum ada
  await supabaseAdmin.storage.createBucket('media', { public: true }).catch(() => {});

  const buffer = await file.arrayBuffer();

  const { error: upErr } = await supabaseAdmin.storage
    .from('media')
    .upload(fileName, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (upErr) return Response.json({ error: 'Upload gagal: ' + upErr.message }, { status: 500 });

  const { data } = supabaseAdmin.storage.from('media').getPublicUrl(fileName);
  return Response.json({ url: data.publicUrl });
}
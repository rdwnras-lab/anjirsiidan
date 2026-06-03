import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.discordId) return Response.json({ error: 'Login diperlukan.' }, { status: 401 });

  const formData = await req.formData();
  const amount            = parseInt(formData.get('amount'));
  const payment_method_id = formData.get('payment_method_id');
  const notes             = formData.get('notes') || null;
  const proofFile         = formData.get('proof');

  if (!amount || amount < 5000)
    return Response.json({ error: 'Nominal minimal Rp 5.000.' }, { status: 400 });
  if (!payment_method_id)
    return Response.json({ error: 'Metode pembayaran wajib dipilih.' }, { status: 400 });
  if (!proofFile || typeof proofFile === 'string')
    return Response.json({ error: 'Bukti transfer wajib diunggah.' }, { status: 400 });

  // Cek metode pembayaran valid
  const { data: pm } = await supabaseAdmin
    .from('payment_methods').select('id, provider, account_number')
    .eq('id', payment_method_id).eq('is_active', true).single();
  if (!pm) return Response.json({ error: 'Metode pembayaran tidak valid.' }, { status: 400 });

  // Upload foto ke Supabase Storage bucket "topup-proofs"
  const ext      = proofFile.name?.split('.').pop() || 'jpg';
  const fileName = `${session.user.discordId}_${Date.now()}.${ext}`;
  const buffer   = await proofFile.arrayBuffer();

  const { error: upErr } = await supabaseAdmin.storage
    .from('topup-proofs')
    .upload(fileName, buffer, { contentType: proofFile.type || 'image/jpeg', upsert: false });

  if (upErr) return Response.json({ error: 'Gagal upload foto: ' + upErr.message }, { status: 500 });

  // Ambil public URL
  const { data: urlData } = supabaseAdmin.storage.from('topup-proofs').getPublicUrl(fileName);
  const proof_url = urlData?.publicUrl || '';

  // Simpan request
  const { data, error } = await supabaseAdmin.from('topup_requests').insert({
    discord_id:        session.user.discordId,
    user_name:         session.user.name || session.user.discordName || '',
    amount,
    payment_method_id,
    proof_url,
    notes,
    status: 'pending',
  }).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Kirim notifikasi ke channel Discord admin
  const CH = '1472092169593557002';
  const BOT = process.env.DISCORD_BOT_TOKEN;
  const fmtN = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(n);
  if (BOT) {
    const buyer = session.user.discordId ? '<@' + session.user.discordId + '>' : (session.user.name || session.user.email || 'User');
    const pmLabel = pm ? pm.provider + ' (' + pm.account_number + ')' : 'Transfer Manual';
    fetch('https://discord.com/api/v10/channels/' + CH + '/messages', {
      method: 'POST',
      headers: { Authorization: 'Bot ' + BOT, 'Content-Type': 'application/json' },
      body: JSON.stringify({ flags: 32768, components: [{ type: 17, components: [
        { type: 10, content: '## REQUEST TOPUP MASUK' },
        { type: 14, divider: true, spacing: 1 },
        { type: 10, content: '**ID**\n`' + data.id + '`\n\n**User**\n' + buyer + '\n\n**Jumlah**\n' + fmtN(parseInt(amount)) + '\n\n**Metode**\n' + pmLabel + '\n\n**Bukti Transfer**\n' + proof_url + '\n\nSetujui/tolak di: https://vechnost.xyz/admin/topup' },
      ]}] }),
    }).catch(e => console.error('[TOPUP NOTIFY]', e.message));
  }

  return Response.json({ ok: true, id: data.id });
}
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

const CH_TOPUP = '1485134784916357292';
const fmt = n => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(n);

async function sendDiscordMsg(channelId, content) {
  const BOT = process.env.DISCORD_BOT_TOKEN;
  if (!BOT) return;
  await fetch('https://discord.com/api/v10/channels/' + channelId + '/messages', {
    method: 'POST',
    headers: { Authorization: 'Bot ' + BOT, 'Content-Type': 'application/json' },
    body: JSON.stringify({ flags: 32768, components: [{ type: 17, components: [
      { type: 10, content: content },
    ]}] }),
  }).catch(e => console.error('[MSG]', e.message));
}

async function openDM(discordId) {
  const BOT = process.env.DISCORD_BOT_TOKEN;
  if (!BOT || !discordId) return null;
  try {
    const r = await fetch('https://discord.com/api/v10/users/@me/channels', {
      method: 'POST',
      headers: { Authorization: 'Bot ' + BOT, 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient_id: discordId }),
    });
    const d = await r.json();
    return d.id || null;
  } catch { return null; }
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin')
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, admin_notes } = await req.json();
  if (!['approve','reject'].includes(action))
    return Response.json({ error: 'Action tidak valid.' }, { status: 400 });

  // Ambil topup request lengkap
  const { data: topup } = await supabaseAdmin
    .from('topup_requests')
    .select('*, payment_methods(provider, account_number)')
    .eq('id', params.id).single();

  if (!topup) return Response.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
  if (topup.status !== 'pending')
    return Response.json({ error: 'Request sudah diproses.' }, { status: 400 });

  const now = new Date().toISOString();

  if (action === 'approve') {
    // Update status DULU - prevent double process
    const { error: stErr } = await supabaseAdmin
      .from('topup_requests')
      .update({ status: 'approved', admin_notes: admin_notes || null, updated_at: now })
      .eq('id', params.id);
    if (stErr) return Response.json({ error: 'Gagal update status.' }, { status: 500 });

    // Ambil user by discord_id
    const { data: user } = await supabaseAdmin
      .from('users').select('id, discord_id').eq('discord_id', topup.discord_id).single();

    let newBalance = topup.amount;

    if (user?.id) {
      // Gunakan SQL function untuk atomic increment
      // Ini avoid column cache issue
      const { error: rpcErr } = await supabaseAdmin.rpc('add_user_balance', {
        p_user_id: user.id,
        p_amount:  topup.amount,
      });

      if (rpcErr) {
        console.error('[RPC add_user_balance]', rpcErr.message);
        // Fallback: raw update
        await supabaseAdmin.from('users')
          .update({ updated_at: now })
          .eq('id', user.id);
        return Response.json({ 
          ok: false, 
          error: 'Saldo gagal diupdate. Pastikan SQL function sudah dibuat dan kolom balance ada.' 
        }, { status: 500 });
      }

      // Get new balance for notification
      const { data: fresh } = await supabaseAdmin
        .from('users').select('id').eq('id', user.id).single();
      newBalance = topup.amount; // will show in DM
    } else {
      // User tidak ada di DB - buat dengan balance awal
      await supabaseAdmin.from('users').insert({
        discord_id: topup.discord_id,
        username: topup.user_name || '',
        tier: 'member',
        created_at: now, updated_at: now,
      }).catch(() => {});
      // Lalu update dengan RPC
      const { data: newUser } = await supabaseAdmin
        .from('users').select('id').eq('discord_id', topup.discord_id).single();
      if (newUser?.id) {
        await supabaseAdmin.rpc('add_user_balance', {
          p_user_id: newUser.id,
          p_amount: topup.amount,
        }).catch(e => console.error('[RPC new user]', e.message));
      }
    }

    const buyerMention = topup.discord_id ? '<@' + topup.discord_id + '>' : (topup.user_name || 'User');
    const method = topup.payment_methods
      ? topup.payment_methods.provider + ' (' + topup.payment_methods.account_number + ')'
      : 'Transfer Manual';

    // Log channel
    sendDiscordMsg(CH_TOPUP,
      '## TOPUP - APPROVED\n' +
      '**User**\n' + buyerMention + '\n\n' +
      '**Jumlah**\n' + fmt(topup.amount) + '\n\n' +
      '**Metode**\n' + method +
      (admin_notes ? '\n\n**Catatan**\n' + admin_notes : '')
    );

    // DM pembeli
    const chId = await openDM(topup.discord_id);
    if (chId) {
      sendDiscordMsg(chId,
        '## TOPUP DISETUJUI\n' +
        '**Jumlah**\n' + fmt(topup.amount) + '\n\n' +
        (admin_notes || 'Saldo kamu telah berhasil ditambahkan!')
      );
    }

  } else {
    // Reject
    await supabaseAdmin.from('topup_requests')
      .update({ status: 'rejected', admin_notes: admin_notes || null, updated_at: now })
      .eq('id', params.id);

    const chId = await openDM(topup.discord_id);
    if (chId) {
      sendDiscordMsg(chId,
        '## TOPUP DITOLAK\n' +
        '**Jumlah**\n' + fmt(topup.amount) + '\n\n' +
        '**Alasan**\n' + (admin_notes || 'Bukti transfer tidak valid.')
      );
    }
  }

  return Response.json({ ok: true });
}
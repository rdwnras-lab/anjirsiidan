import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

const CH_TOPUP = '1485134784916357292';

const fmt = n => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
}).format(n);

async function postToChannel(channelId, payload) {
  const BOT = process.env.DISCORD_BOT_TOKEN;
  if (!BOT) return;
  await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

async function sendDM(discordId, payload) {
  const BOT = process.env.DISCORD_BOT_TOKEN;
  if (!BOT || !discordId) return;
  const res = await fetch('https://discord.com/api/v10/users/@me/channels', {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient_id: discordId }),
  });
  const { id: chId } = await res.json();
  await postToChannel(chId, payload);
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin')
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, admin_notes } = await req.json();
  if (!['approve', 'reject'].includes(action))
    return Response.json({ error: 'Action tidak valid.' }, { status: 400 });

  // Ambil request topup + metode pembayaran
  const { data: topup } = await supabaseAdmin
    .from('topup_requests')
    .select('*, payment_methods(provider, account_number)')
    .eq('id', params.id).single();

  if (!topup)
    return Response.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
  if (topup.status !== 'pending')
    return Response.json({ error: 'Request sudah diproses.' }, { status: 400 });

  const now = new Date().toISOString();

  if (action === 'approve') {
    // Update status topup dulu
    const { error: statusErr } = await supabaseAdmin.from('topup_requests').update({
      status: 'approved', admin_notes: admin_notes || null, updated_at: now,
    }).eq('id', params.id);
    if (statusErr) return Response.json({ error: 'Gagal update status: ' + statusErr.message }, { status: 500 });

    // Tambah saldo user
    const { data: user, error: userErr } = await supabaseAdmin
      .from('users').select('id, balance').eq('discord_id', topup.discord_id).single();
    
    console.log('[TOPUP] discord_id:', topup.discord_id, 'user found:', !!user, 'userErr:', userErr?.message);
    
    const currentBalance = user?.balance || 0;
    const newBalance = currentBalance + topup.amount;

    if (user?.id) {
      // User ada - update balance langsung
      const { error: balErr } = await supabaseAdmin.from('users')
        .update({ balance: newBalance, updated_at: now })
        .eq('id', user.id);
      if (balErr) {
        console.error('[TOPUP BALANCE UPDATE]', balErr.message);
        return Response.json({ error: 'Saldo gagal ditambahkan: ' + balErr.message }, { status: 500 });
      }
      console.log('[TOPUP] Balance updated:', currentBalance, '->', newBalance);
    } else {
      // User belum ada - insert
      const { error: insErr } = await supabaseAdmin.from('users').insert({
        discord_id: topup.discord_id,
        username:   topup.user_name || '',
        balance:    newBalance,
        tier:       'member',
        created_at: now, updated_at: now,
      });
      if (insErr) {
        console.error('[TOPUP USER INSERT]', insErr.message);
        return Response.json({ error: 'User tidak ditemukan di database.' }, { status: 500 });
      }
    }

    const buyerMention = topup.discord_id ? `<@${topup.discord_id}>` : (topup.user_name || 'User');
    const methodLabel  = topup.payment_methods
      ? `${topup.payment_methods.provider} (${topup.payment_methods.account_number})`
      : 'Transfer Manual';

    // ── Log ke channel #log-topup ──
    await postToChannel(CH_TOPUP, {
      flags: 32768,
      components: [{
        type: 17,
        components: [
          { type: 10, content: '## TOPUP - APPROVED ✅' },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: [
            `**User**`,       buyerMention,
            ``,
            `**Jumlah**`,     fmt(topup.amount),
            ``,
            `**Metode**`,     methodLabel,
            ``,
            `**Saldo Baru**`, fmt(newBalance),
            admin_notes ? `\n**Catatan**\n${admin_notes}` : '',
          ].filter(Boolean).join('\n') },
        ],
      }],
    }).catch(e => console.error('[LOG TOPUP]', e.message));

    // ── DM ke pembeli ──
    await sendDM(topup.discord_id, {
      flags: 32768,
      components: [{
        type: 17,
        components: [
          { type: 10, content: '## TOPUP - DISETUJUI ✅' },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: [
            `**Jumlah**`,    fmt(topup.amount),
            ``,
            `**Saldo Baru**`, fmt(newBalance),
            admin_notes ? `\n**Catatan Admin**\n${admin_notes}` : `\nSaldo kamu telah berhasil ditambahkan!`,
          ].filter(Boolean).join('\n') },
        ],
      }],
    }).catch(e => console.error('[DM TOPUP APPROVE]', e.message));

  } else {
    // Reject
    await supabaseAdmin.from('topup_requests').update({
      status: 'rejected', admin_notes: admin_notes || null, updated_at: now,
    }).eq('id', params.id);

    // ── DM ke pembeli ──
    await sendDM(topup.discord_id, {
      flags: 32768,
      components: [{
        type: 17,
        components: [
          { type: 10, content: '## TOPUP - DITOLAK ❌' },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: [
            `**Jumlah**`,  fmt(topup.amount),
            ``,
            `**Alasan**`,  admin_notes || 'Bukti transfer tidak valid atau tidak sesuai.',
          ].join('\n') },
        ],
      }],
    }).catch(e => console.error('[DM TOPUP REJECT]', e.message));
  }

  return Response.json({ ok: true });
}
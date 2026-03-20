// Discord DM & Channel delivery dengan Components V2

const BASE        = 'https://discord.com/api/v10';
const GUILD_ID    = '1452588094334435465';
const CH_ORDERS   = '1476338840267653221'; // log orderan (pending)
const CH_TRANS    = '1482435497883205813'; // log transaksi (sukses)

function formatIDR(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(n || 0);
}

function botHeaders() {
  return {
    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function openDM(discordUserId) {
  const res = await fetch(`${BASE}/users/@me/channels`, {
    method: 'POST',
    headers: botHeaders(),
    body: JSON.stringify({ recipient_id: discordUserId }),
  });
  if (!res.ok) throw new Error('Cannot open DM: ' + await res.text());
  return (await res.json()).id;
}

async function postToChannel(channelId, payload) {
  const res = await fetch(`${BASE}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: botHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cannot post to ${channelId}: ${err}`);
  }
  return res.json();
}

// ── Auto-join user ke guild setelah Discord OAuth
export async function addMemberToGuild({ discordUserId, accessToken }) {
  if (!discordUserId || !accessToken) return { ok: false };
  try {
    const res = await fetch(`${BASE}/guilds/${GUILD_ID}/members/${discordUserId}`, {
      method: 'PUT',
      headers: botHeaders(),
      body: JSON.stringify({ access_token: accessToken }),
    });
    // 201 = added, 204 = already member — keduanya ok
    return { ok: res.status === 201 || res.status === 204 };
  } catch (e) {
    console.error('[ADD MEMBER]', e.message);
    return { ok: false };
  }
}

// ── DM PENDING: kirim ke DM user saat order dibuat
export async function sendPendingDM({ discordUserId, orderData }) {
  if (!process.env.DISCORD_BOT_TOKEN || !discordUserId) return { ok: false };
  const { orderId, productName, variantName, baseAmount, feeAmount, totalAmount } = orderData;

  try {
    const channelId = await openDM(discordUserId);
    await postToChannel(channelId, {
      flags: 32768,
      components: [{
        type: 17,
        components: [
          { type: 10, content: '## PAYMENT - PENDING' },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: [
              `**Product**`,
              productName,
              ``,
              `**Item**`,
              variantName,
              ``,
              `**Price**`,
              formatIDR(baseAmount),
              ``,
              `**Fee**`,
              formatIDR(feeAmount),
              ``,
              `**Total**`,
              formatIDR(totalAmount),
              ``,
              `Silakan lanjutkan pembayaran di: ${process.env.NEXT_PUBLIC_APP_URL || 'https://vechnost.xyz'}/checkout/${orderId}`,
            ].join('\n') },
          { type: 14, divider: true, spacing: 1 },
        ],
      }],
    });
    return { ok: true };
  } catch (e) {
    console.error('[DM PENDING]', e.message);
    return { ok: false, error: e.message };
  }
}

// ── DM SUCCESS: kirim ke DM user saat pembayaran sukses
export async function deliverViaDiscordDM({ discordUserId, orderData }) {
  if (!process.env.DISCORD_BOT_TOKEN || !discordUserId) return { ok: false };
  const { orderId, productName, variantName, baseAmount, feeAmount, totalAmount, keys } = orderData;
  const keyContent = keys?.[0]?.key_content || '-';

  try {
    const channelId = await openDM(discordUserId);
    await postToChannel(channelId, {
      flags: 32768,
      components: [{
        type: 17,
        components: [
          { type: 10, content: '## PAYMENT - SUCCESS' },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: [
              `**Product**`,
              productName,
              ``,
              `**Item**`,
              variantName,
              ``,
              `**Price**`,
              formatIDR(baseAmount),
              ``,
              `**Fee**`,
              formatIDR(feeAmount),
              ``,
              `**Total**`,
              formatIDR(totalAmount),
              ``,
              `Silakan lanjutkan pembayaran di: ${process.env.NEXT_PUBLIC_APP_URL || 'https://vechnost.xyz'}/checkout/${orderId}`,
            ].join('\n') },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: `**Here is your ${variantName}**\n\`\`\`\n${keyContent}\n\`\`\`` },
        ],
      }],
    });
    return { ok: true };
  } catch (e) {
    console.error('[DM SUCCESS]', e.message);
    return { ok: false, error: e.message };
  }
}

// ── CHANNEL LOG PENDING: kirim ke channel log orderan
export async function logOrderToChannel({ orderData }) {
  if (!process.env.DISCORD_BOT_TOKEN) return { ok: false };
  const { orderId, productName, variantName, baseAmount, feeAmount, totalAmount, deliveryType, discordUserId, customerWhatsapp } = orderData;

  const typeLabel = deliveryType === 'auto' ? 'Otomatis' : 'Manual';
  const buyerLine = discordUserId ? `<@${discordUserId}>` : 'Guest';
  const waLine    = customerWhatsapp ? `\n\n**WhatsApp**\n${customerWhatsapp}` : '';

  try {
    await postToChannel(CH_ORDERS, {
      flags: 32768,
      components: [{
        type: 17,
        components: [
          { type: 10, content: '## PAYMENT - PENDING' },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: `**Type**\n${typeLabel}\n\n**Product**\n${productName}\n\n**Item**\n${variantName}\n\n**Price**\n${formatIDR(baseAmount)}\n\n**Fee**\n${formatIDR(feeAmount)}\n\n**Total**\n${formatIDR(totalAmount)}\n\n**Buyer**\n${buyerLine}${waLine}\n\n**Order ID**\n\`${orderId}\`` },
        ],
      }],
    });
    return { ok: true };
  } catch (e) {
    console.error('[LOG ORDER]', e.message);
    return { ok: false, error: e.message };
  }
}

// ── CHANNEL LOG SUCCESS: kirim ke channel log transaksi
export async function logTransactionToChannel({ orderData, transactionNumber }) {
  if (!process.env.DISCORD_BOT_TOKEN) return { ok: false };
  const { productName, variantName, baseAmount, feeAmount, totalAmount, deliveryType, discordUserId } = orderData;

  const typeLabel = deliveryType === 'auto' ? 'Otomatis' : 'Manual';
  const buyerLine = discordUserId ? `<@${discordUserId}>` : 'Guest';

  try {
    await postToChannel(CH_TRANS, {
      flags: 32768,
      components: [{
        type: 17,
        components: [
          { type: 10, content: '## VECHNOST - TRANSACTION' },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: `__#${transactionNumber} website transaction__\n\n**Type**\n${typeLabel}\n\n**Product**\n${productName}\n\n**Item**\n${variantName}\n\n**Price**\n${formatIDR(baseAmount)}\n\n**Fee**\n${formatIDR(feeAmount)}\n\n**Total**\n${formatIDR(totalAmount)}\n\n**Buyer**\n${buyerLine}` },
        ],
      }],
    });
    return { ok: true };
  } catch (e) {
    console.error('[LOG TRANS]', e.message);
    return { ok: false, error: e.message };
  }
}
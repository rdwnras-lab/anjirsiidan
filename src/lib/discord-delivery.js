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
  const { orderId, productName, variantName, baseAmount, feeAmount, totalAmount, keys, deliveryType, qty } = orderData;
  const isAuto     = deliveryType === 'auto';
  const hasKeys    = isAuto && keys && keys.length > 0 && keys[0]?.key_content;
  const keyContent = hasKeys ? keys[0].key_content : null;
  const qtyLabel   = (qty && qty > 1) ? ` ×${qty}` : '';

  // Body section utama (sama untuk auto & manual)
  const bodyLines = [
    `**Product**`, productName, ``,
    `**Item**`, `${variantName}${qtyLabel}`, ``,
    `**Price**`, formatIDR(baseAmount), ``,
    `**Fee**`, formatIDR(feeAmount), ``,
    `**Total**`, formatIDR(totalAmount),
  ];

  // Footer berbeda: auto = key, manual = tunggu admin
  const footerContent = hasKeys
    ? `**Here is your ${variantName}**
\`\`\`
${keyContent}
\`\`\``
    : `Admin sedang memproses pesananmu, mohon ditunggu.`;

  try {
    const channelId = await openDM(discordUserId);
    await postToChannel(channelId, {
      flags: 32768,
      components: [{
        type: 17,
        components: [
          { type: 10, content: '## PAYMENT - SUCCESS' },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: bodyLines.join('\n') },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: footerContent },
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
  const {
    productName, variantName, baseAmount, feeAmount, totalAmount,
    deliveryType, customerWhatsapp, formData,
  } = orderData;

  // Bangun baris form fields (jika ada)
  const formLines = [];
  if (formData && typeof formData === 'object') {
    for (const [key, val] of Object.entries(formData)) {
      if (val) formLines.push(`**${key}**\n${val}`);
    }
  }

  // Susun semua baris konten
  const lines = [
    ...formLines,
    customerWhatsapp ? `**No WhatsApp**\n${customerWhatsapp}` : null,
    `**Product**\n${productName}`,
    `**Item**\n${variantName}`,
    `**Price**\n${formatIDR(baseAmount)}`,
    `**Fee**\n${deliveryType === 'auto' ? formatIDR(feeAmount) : 'Rp 0'}`,
    `**Total**\n${formatIDR(totalAmount)}`,
  ].filter(Boolean);

  try {
    await postToChannel(CH_ORDERS, {
      flags: 32768,
      components: [{
        type: 17,
        components: [
          { type: 10, content: '## NEW ORDER!' },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: lines.join('\n\n') },
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
  const { productName, variantName, baseAmount, feeAmount, totalAmount, deliveryType, discordUserId, customerWhatsapp, qty } = orderData;

  const typeLabel = deliveryType === 'auto' ? 'Otomatis' : 'Manual';
  // Buyer: jika login → mention Discord, jika tidak → sensor WA (3 depan *** 3 belakang)
  let buyerLine;
  if (discordUserId) {
    buyerLine = `<@${discordUserId}>`;
  } else if (customerWhatsapp) {
    const wa = String(customerWhatsapp).trim();
    buyerLine = wa.length >= 6
      ? wa.slice(0, 3) + '***' + wa.slice(-3)
      : wa;
  } else {
    buyerLine = 'Guest';
  }

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
// Discord DM delivery dengan Components V2
// Docs: https://discord.com/developers/docs/components/overview

const BASE = 'https://discord.com/api/v10';

function formatIDR(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(n || 0);
}

async function openDM(discordUserId) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const res = await fetch(`${BASE}/users/@me/channels`, {
    method: 'POST',
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient_id: discordUserId }),
  });
  if (!res.ok) throw new Error('Cannot open DM: ' + await res.text());
  return (await res.json()).id;
}

async function sendMessage(channelId, payload) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const res = await fetch(`${BASE}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Cannot send message: ' + await res.text());
  return res.json();
}

// ── Kirim DM saat order dibuat (PAYMENT - PENDING)
export async function sendPendingDM({ discordUserId, orderData }) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token || !discordUserId) return { ok: false, error: 'No token or userId' };

  const { orderId, productName, variantName, baseAmount, feeAmount, totalAmount } = orderData;

  try {
    const channelId = await openDM(discordUserId);

    const payload = {
      flags: 32768, // IS_COMPONENTS_V2
      components: [
        {
          type: 17, // Container
          accent_color: 0xF59E0B, // amber = pending
          components: [
            {
              type: 10, // TextDisplay
              content: '## 🕐 PAYMENT - PENDING',
            },
            { type: 14, divider: true, spacing: 1 }, // Separator
            {
              type: 10,
              content: [
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
                `-# Order ID: ${orderId}`,
              ].join('\n'),
            },
          ],
        },
      ],
    };

    await sendMessage(channelId, payload);
    return { ok: true };
  } catch (e) {
    console.error('[DM PENDING]', e.message);
    return { ok: false, error: e.message };
  }
}

// ── Kirim DM saat pembayaran sukses (PAYMENT - SUCCESS)
export async function deliverViaDiscordDM({ discordUserId, orderData }) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token || !discordUserId) return { ok: false, error: 'No token or userId' };

  const { orderId, productName, variantName, baseAmount, feeAmount, totalAmount, keys } = orderData;
  const keyContent = keys?.[0]?.key_content || '-';

  try {
    const channelId = await openDM(discordUserId);

    const payload = {
      flags: 32768, // IS_COMPONENTS_V2
      components: [
        {
          type: 17, // Container
          accent_color: 0x22C55E, // green = success
          components: [
            {
              type: 10,
              content: '## ✅ PAYMENT - SUCCESS',
            },
            { type: 14, divider: true, spacing: 1 },
            {
              type: 10,
              content: [
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
              ].join('\n'),
            },
            { type: 14, divider: true, spacing: 1 },
            {
              type: 10,
              content: [
                `**Here is your ${variantName}**`,
                `\`\`\``,
                keyContent,
                `\`\`\``,
                `-# ⚠️ Simpan pesan ini. Jangan bagikan kode kepada siapapun.`,
                `-# Order ID: ${orderId}`,
              ].join('\n'),
            },
          ],
        },
      ],
    };

    await sendMessage(channelId, payload);
    return { ok: true };
  } catch (e) {
    console.error('[DM SUCCESS]', e.message);
    return { ok: false, error: e.message };
  }
}
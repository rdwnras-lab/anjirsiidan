// Auto-delivery via Discord DM using REST API directly (no discord.js needed)

export async function deliverViaDiscordDM({ discordUserId, orderData }) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return { ok: false, error: 'Bot token not configured' };

  try {
    // Step 1: Create DM channel
    const dmRes = await fetch('https://discord.com/api/v10/users/@me/channels', {
      method: 'POST',
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient_id: discordUserId }),
    });

    if (!dmRes.ok) {
      const err = await dmRes.text();
      return { ok: false, error: 'Cannot open DM: ' + err };
    }

    const dmChannel = await dmRes.json();

    // Step 2: Build message
    const { orderId, productName, variantName, keys, storeName } = orderData;
    const keyLines = keys.map((k, i) => `**[${i + 1}]** \`${k.key_content}\``).join('\n');

    const content = [
      `## ✅ Pesanan Berhasil`,
      `**Toko:** ${storeName || 'VECHNOST'}`,
      `**Produk:** ${productName} — ${variantName}`,
      `**Order ID:** \`${orderId}\``,
      '',
      `### Isi Pesanan Kamu:`,
      keyLines,
      '',
      `> ⚠️ Simpan pesan ini. Jangan bagikan kode kepada siapapun.`,
    ].join('\n');

    // Step 3: Send message
    const msgRes = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!msgRes.ok) {
      const err = await msgRes.text();
      return { ok: false, error: 'Cannot send DM: ' + err };
    }

    return { ok: true };
  } catch (e) {
    console.error('[DM DELIVERY]', e.message);
    return { ok: false, error: e.message };
  }
}

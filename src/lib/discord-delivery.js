// Auto-delivery via Discord DM
// Called after payment confirmed for auto-type products

import { Client, GatewayIntentBits } from 'discord.js';

let _client = null;

async function getBot() {
  if (_client?.isReady()) return _client;
  _client = new Client({ intents: [GatewayIntentBits.Guilds] });
  await _client.login(process.env.DISCORD_BOT_TOKEN);
  await new Promise(r => _client.once('ready', r));
  return _client;
}

export async function deliverViaDiscordDM({ discordUserId, orderData }) {
  try {
    const bot  = await getBot();
    const user = await bot.users.fetch(discordUserId).catch(() => null);
    if (!user) return { ok: false, error: 'Discord user not found' };

    const { orderId, productName, variantName, keys, storeName } = orderData;

    const keyBlocks = keys.map((k, i) =>
      `**[${i+1}]** \`${k.key_content}\``
    ).join('\n');

    const msg = [
      `## ✅ Pesanan Berhasil`,
      `**Toko:** ${storeName || process.env.NEXT_PUBLIC_STORE_NAME || 'VECHNOST'}`,
      `**Produk:** ${productName} — ${variantName}`,
      `**Order ID:** \`${orderId}\``,
      '',
      `### Isi Pesanan Kamu:`,
      keyBlocks,
      '',
      `> ⚠️ Simpan pesan ini baik-baik. Jangan bagikan kode kepada siapapun.`,
    ].join('\n');

    await user.send(msg);
    return { ok: true };
  } catch (e) {
    console.error('[DM DELIVERY]', e.message);
    return { ok: false, error: e.message };
  }
}

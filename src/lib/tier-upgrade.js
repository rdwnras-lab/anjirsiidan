// Tier upgrade otomatis berdasarkan total_spent dari DB tier_settings
import { supabaseAdmin } from './supabase';

/**
 * Cek dan upgrade tier user jika total_spent memenuhi syarat.
 * Dipanggil setelah setiap order completed.
 * @param {string} discordId
 * @param {number} additionalAmount - Jumlah yang baru ditambahkan
 */
export async function checkAndUpgradeTier(discordId, additionalAmount = 0) {
  if (!discordId) return;

  try {
    // Ambil data user
    const { data: user } = await supabaseAdmin
      .from('users').select('id, tier, total_spent')
      .eq('discord_id', discordId).single();
    if (!user) return;

    // Update total_spent
    const newTotalSpent = (user.total_spent || 0) + additionalAmount;
    await supabaseAdmin.from('users')
      .update({ total_spent: newTotalSpent, updated_at: new Date().toISOString() })
      .eq('discord_id', discordId);

    // Ambil semua tier aktif, urutkan dari tertinggi (min_spent terbesar)
    const { data: tiers } = await supabaseAdmin
      .from('tier_settings')
      .select('*')
      .eq('is_active', true)
      .order('min_spent', { ascending: false });

    if (!tiers || tiers.length === 0) return;

    // Cari tier tertinggi yang memenuhi syarat
    const newTier = tiers.find(t => newTotalSpent >= t.min_spent);
    if (!newTier) return;

    const newTierName = newTier.tier_name.toLowerCase();
    if (newTierName === (user.tier || 'member').toLowerCase()) return;

    // Upgrade tier
    await supabaseAdmin.from('users')
      .update({ tier: newTierName, updated_at: new Date().toISOString() })
      .eq('discord_id', discordId);

    console.log(`[TIER] ${discordId} upgraded to ${newTierName} (total_spent: ${newTotalSpent})`);
  } catch (e) {
    console.error('[TIER UPGRADE]', e.message);
  }
}

/**
 * Ambil diskon untuk tier tertentu dari DB.
 * Return angka 0-1 (misal 0.1 = 10%).
 */
export async function getTierDiscount(tierName) {
  if (!tierName || tierName === 'member') return 0;
  try {
    const { data } = await supabaseAdmin
      .from('tier_settings')
      .select('discount')
      .eq('tier_name', tierName.toLowerCase())
      .eq('is_active', true)
      .single();
    return parseFloat(data?.discount || 0);
  } catch {
    return 0;
  }
}
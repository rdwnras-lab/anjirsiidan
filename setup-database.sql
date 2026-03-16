-- ================================================================
-- DIGISHOP — Full Database Setup
-- Run in Supabase SQL Editor
-- ================================================================

-- Users (Discord OAuth customers)
CREATE TABLE IF NOT EXISTS users (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discord_id   TEXT UNIQUE NOT NULL,
  username     TEXT,
  avatar       TEXT,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  description  TEXT,
  icon         TEXT,            -- emoji or image URL
  sort_order   INT DEFAULT 0,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  thumbnail       TEXT,         -- image URL
  delivery_type   TEXT NOT NULL DEFAULT 'manual',
                                -- 'auto' = kirim key otomatis via Discord + halaman
                                -- 'manual' = admin proses manual
  form_fields     JSONB DEFAULT '[]',
                                -- custom fields untuk checkout
                                -- e.g. [{"label":"Game ID","placeholder":"123456","required":true}]
  is_active       BOOLEAN DEFAULT true,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Product Variants (harga berbeda per varian)
CREATE TABLE IF NOT EXISTS product_variants (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,   -- e.g. "50 Diamond", "1 Bulan", "Akun Basic"
  price       INT NOT NULL,    -- in IDR (no decimals)
  is_active   BOOLEAN DEFAULT true,
  sort_order  INT DEFAULT 0
);

-- Product Keys / Stock (for auto delivery)
CREATE TABLE IF NOT EXISTS product_keys (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id  UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  key_content TEXT NOT NULL,   -- the actual key/code/account credentials
  is_used     BOOLEAN DEFAULT false,
  used_at     TIMESTAMP,
  order_id    TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY,  -- DS-YYYYMMDD-XXXXX
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  discord_id      TEXT,             -- for non-logged users with manual products
  product_id      UUID REFERENCES products(id),
  variant_id      UUID REFERENCES product_variants(id),
  product_name    TEXT NOT NULL,
  variant_name    TEXT NOT NULL,
  delivery_type   TEXT NOT NULL,    -- 'auto' | 'manual'
  customer_name   TEXT,
  customer_whatsapp TEXT,
  customer_notes  TEXT,
  form_data       JSONB DEFAULT '{}', -- custom form field answers
  base_amount     INT NOT NULL,
  fee_amount      INT NOT NULL,
  total_amount    INT NOT NULL,
  status          TEXT DEFAULT 'pending',
                  -- pending | paid | processing | completed | failed | cancelled
  payment_method  TEXT DEFAULT 'qris',
  payment_qr      TEXT,             -- QRIS string from Pakasir
  payment_expired_at TIMESTAMP,
  delivery_status TEXT DEFAULT 'pending',
                  -- pending | delivered | failed
  delivered_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Order Delivered Keys (which keys were sent for this order)
CREATE TABLE IF NOT EXISTS order_keys (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id   TEXT REFERENCES orders(id) ON DELETE CASCADE,
  key_id     UUID REFERENCES product_keys(id),
  key_content TEXT NOT NULL,   -- copy stored at time of delivery
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug     ON products(slug);
CREATE INDEX IF NOT EXISTS idx_variants_product  ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_keys_product      ON product_keys(product_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_keys_unused       ON product_keys(is_used) WHERE is_used = false;
CREATE INDEX IF NOT EXISTS idx_orders_discord    ON orders(discord_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);

-- ── Sample Categories ─────────────────────────────────────────────
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
  ('Game Top Up',    'game-topup',  'Top up diamond, UC, koin game favorit kamu', '🎮', 1),
  ('App Premium',    'app-premium', 'Berlangganan aplikasi premium dengan harga terjangkau', '📱', 2),
  ('Akun Premium',   'akun',        'Akun premium siap pakai', '👤', 3),
  ('Software',       'software',    'Lisensi software original', '💻', 4)
ON CONFLICT (slug) DO NOTHING;

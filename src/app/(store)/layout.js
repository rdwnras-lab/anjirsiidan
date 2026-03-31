import { supabaseAdmin } from '@/lib/supabase';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';

export default async function StoreLayout({ children }) {
  // Ambil warna dari DB
  let colors = {};
  try {
    const { data } = await supabaseAdmin
      .from('site_settings').select('value').eq('key', 'colors').single();
    if (data?.value) colors = JSON.parse(data.value);
  } catch {}

  // Bangun CSS custom properties
  const css = Object.entries(colors).map(([k, v]) => `--color-${k.replace(/_/g,'-')}:${v}`).join(';');

  return (
    <div className="min-h-screen flex flex-col" style={css ? { [Symbol.iterator]: undefined, cssText: css } : {}}>
      {css && <style>{`:root{${css}}`}</style>}
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
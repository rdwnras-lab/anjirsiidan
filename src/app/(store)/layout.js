import { supabaseAdmin } from '@/lib/supabase';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';

export default async function StoreLayout({ children }) {
  let css = '';
  try {
    const { data } = await supabaseAdmin
      .from('site_settings').select('value').eq('key', 'colors').single();
    if (data?.value) {
      const colors = JSON.parse(data.value);
      css = Object.entries(colors)
        .map(([k, v]) => '--c-' + k.replace(/_/g, '-') + ':' + v)
        .join(';');
    }
  } catch {}

  return (
    <>
      {css && <style>{':root{' + css + '}'}</style>}
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
export default function StoreLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

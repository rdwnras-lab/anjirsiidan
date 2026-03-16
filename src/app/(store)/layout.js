import StoreNavbar from '@/components/store/Navbar';
import StoreFooter from '@/components/store/Footer';

export default function StoreLayout({ children }) {
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:'#0a0a12'}}>
      <StoreNavbar />
      <main style={{flex:1}}>{children}</main>
      <StoreFooter />
    </div>
  );
}

export default function Footer() {
  const name = process.env.NEXT_PUBLIC_STORE_NAME || 'VECHNOST';
  return (
    <footer className="border-t border-border mt-20 py-10 text-center text-sm text-muted">
      <p>© {new Date().getFullYear()} {name}. Semua hak dilindungi.</p>
      <p className="mt-1 text-xs">Pembayaran aman via QRIS Pakasir</p>
    </footer>
  );
}

import Link from 'next/link';

// Product card — does NOT show price (like sekalipay)
// Price revealed only on product detail page
export default function ProductCard({ product, stockCount }) {
  const inStock = stockCount === undefined ? true : stockCount > 0;
  const isAuto  = product.delivery_type === 'auto';

  return (
    <Link href={`/products/${product.slug}`}
      className="group bg-card border border-border hover:border-accent/40 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 block">
      {/* Thumbnail */}
      <div className="aspect-video bg-surface relative overflow-hidden">
        {product.thumbnail
          ? <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-accent/10 to-purple-900/20">{product.icon || '📦'}</div>
        }
        {/* Stock badge */}
        <div className="absolute top-2 right-2">
          {isAuto && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${inStock ? 'bg-success/20 text-success border border-success/30' : 'bg-danger/20 text-danger border border-danger/30'}`}>
              {inStock ? `${stockCount > 99 ? '99+' : stockCount} stok` : 'Habis'}
            </span>
          )}
        </div>
        {/* Delivery type badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isAuto ? 'bg-accent/20 text-accent-light border border-accent/30' : 'bg-white/10 text-dim border border-white/10'}`}>
            {isAuto ? '⚡ Otomatis' : '👤 Manual'}
          </span>
        </div>
      </div>
      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-sm text-text leading-tight">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-muted mt-1 line-clamp-2">{product.description}</p>
        )}
        <p className="text-xs text-accent-light mt-3 font-semibold">Lihat harga →</p>
      </div>
    </Link>
  );
}

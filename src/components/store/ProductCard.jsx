'use client';
import Link from 'next/link';

export default function ProductCard({ product, stockCount }) {
  const inStock = stockCount === undefined ? true : stockCount > 0;
  const isAuto  = product.delivery_type === 'auto';

  return (
    <Link href={`/products/${product.slug}`}
      className="product-card group block"
      style={{textDecoration:'none', color:'inherit'}}>
      <div className="relative rounded-2xl overflow-hidden border-2 transition-all duration-200"
        style={{borderColor:'#1d4ed8', background:'var(--card-bg)'}}>
        {/* Image */}
        <div className="aspect-square relative overflow-hidden bg-surface">
          {product.thumbnail
            ? <img
                src={product.thumbnail}
                alt={product.name}
                className="product-card-img w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            : <div className="product-card-img w-full h-full flex items-center justify-center text-4xl"
                style={{background:'linear-gradient(135deg, rgba(29,111,255,0.1), rgba(13,59,138,0.2))'}}>
                {product.icon || '📦'}
              </div>
          }
          {/* Stock badge */}
          {isAuto && (
            <div className="absolute top-2 right-2">
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                inStock ? 'bg-success/20 text-success border border-success/30' : 'bg-danger/20 text-danger border border-danger/30'
              }`}>
                {inStock ? (stockCount > 99 ? '99+' : stockCount) : '✗'}
              </span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{background:'rgba(0,0,0,0.4)'}}>
            <span className="text-white font-bold text-xs bg-accent rounded-lg px-3 py-1.5 shadow-lg">
              Lihat →
            </span>
          </div>
        </div>
        {/* Info */}
        <div className="p-2.5">
          <h3 className="font-bold text-xs text-white leading-tight line-clamp-2">{product.name}</h3>
          {product.category?.name && (
            <p className="text-xs mt-0.5" style={{color:'var(--accent-light)', opacity:0.7}}>{product.category.name}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

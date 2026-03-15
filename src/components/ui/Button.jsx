'use client';
const V = {
  primary: 'bg-accent hover:bg-accent-h text-white',
  ghost:   'bg-white/5 hover:bg-white/10 text-dim border border-border',
  danger:  'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20',
  gold:    'bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20',
};
export default function Button({ children, onClick, variant='primary', disabled, className='', type='button', size='md' }) {
  const sz = size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm';
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${V[variant]||V.primary} ${sz} rounded-xl font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 ${className}`}>
      {children}
    </button>
  );
}

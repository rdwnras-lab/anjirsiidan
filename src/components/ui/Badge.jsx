const colors = {
  green:  'bg-success/15 text-success border-success/20',
  yellow: 'bg-gold/15 text-gold border-gold/20',
  red:    'bg-danger/15 text-danger border-danger/20',
  purple: 'bg-accent/15 text-accent-light border-accent/20',
  gray:   'bg-white/5 text-dim border-white/10',
};
const statusColor = {
  pending:    'yellow',
  paid:       'purple',
  processing: 'purple',
  completed:  'green',
  failed:     'red',
  cancelled:  'gray',
  delivered:  'green',
};
export default function Badge({ children, color, status }) {
  const c = colors[color || statusColor[status] || 'gray'];
  return (
    <span className={`${c} text-xs font-semibold px-2.5 py-1 rounded-full border`}>{children}</span>
  );
}

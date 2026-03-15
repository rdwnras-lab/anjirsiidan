export default function Input({ label, desc, ...props }) {
  return (
    <div>
      {label && <label className="text-sm text-dim block mb-1.5">{label}</label>}
      <input className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder-muted outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all" {...props} />
      {desc && <p className="text-xs text-muted mt-1.5">{desc}</p>}
    </div>
  );
}

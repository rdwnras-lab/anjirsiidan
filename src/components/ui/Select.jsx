export default function Select({ label, options, ...props }) {
  return (
    <div>
      {label && <label className="text-sm text-dim block mb-1.5">{label}</label>}
      <select className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm text-text outline-none focus:border-accent/50 cursor-pointer" {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

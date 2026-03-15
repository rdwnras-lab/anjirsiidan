export default function EmptyState({ icon='📭', title, desc }) {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-text mb-1">{title}</h3>
      {desc && <p className="text-sm text-muted">{desc}</p>}
    </div>
  );
}

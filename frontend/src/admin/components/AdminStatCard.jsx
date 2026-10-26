export default function AdminStatCard({ icon: Icon, label, value }) {
  return (
    <article className="stat-card">
      <span>{Icon && <Icon aria-hidden="true" />}</span>
      <small>{label}</small>
      <strong>{value ?? "—"}</strong>
    </article>
  );
}

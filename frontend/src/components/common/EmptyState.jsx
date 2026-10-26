/** Reusable empty state for lists, tables, and search results. */
export default function EmptyState({ title, description, action = null }) {
  return (
    <section className="empty-state" aria-live="polite">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </section>
  );
}

/** Consistent loading feedback for pages that depend on API requests. */
export default function LoadingState({ message = "Loading…" }) {
  return (
    <main className="page-shell" role="status" aria-live="polite">
      <p>{message}</p>
    </main>
  );
}

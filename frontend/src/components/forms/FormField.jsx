/** Accessible label/control wrapper used by forms across the storefront. */
export default function FormField({ label, htmlFor, hint, error, children }) {
  return (
    <div className={`form-field${error ? " has-error" : ""}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <small className="field-hint">{hint}</small>}
      {error && <small className="field-error" role="alert">{error}</small>}
    </div>
  );
}

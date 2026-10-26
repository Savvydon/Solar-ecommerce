import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLoginPage() {
  const { user, loading, login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user?.role === "admin") return <Navigate to="/admin" replace />;

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const account = await login(email, password);
      if (account.role !== "admin") {
        logout();
        setError("This account does not have administrator access.");
        return;
      }
      navigate("/admin", { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Unable to sign in. Check your details and try again.");
    } finally { setBusy(false); }
  }

  return <main className="admin-login-page"><form className="admin-login-card" onSubmit={submit}>
    <span className="admin-login-icon"><ShieldCheck size={25} /></span>
    <p className="eyebrow">SAVVY ENERGY · SECURE ACCESS</p><h1>Administrator sign in</h1>
    <p>Sign in with your authorised administrator account to manage the store.</p>
    <label>Email address<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
    <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
    {error && <div className="notice error" role="alert">{error}</div>}
    <button className="button primary wide" disabled={busy || loading}>{busy ? "Signing in…" : "Sign in to administration"} <LockKeyhole size={16} /></button>
    <Link className="back-link centered" to="/">Return to storefront</Link>
  </form></main>;
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register: signup } = useAuth();
  const navigate = useNavigate();

  // Authentication mode switcher (Login vs Registration)
  const [register, setRegister] = useState(false);

  // Form State Configurations
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Handle identity validation and adaptive routing gates
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const u = register 
        ? await signup(name, email, password) 
        : await login(email, password);
        
      // Adaptive routing based on authorized account permissions
      navigate(u.role === 'admin' ? '/admin' : '/account');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        {/* Brand Stamp */}
        <div className="auth-mark">
          <Leaf />
        </div>
        
        <p className="eyebrow">WELCOME TO SAVVY ENERGY</p>
        <h1>{register ? 'Create your account' : 'Good to see you.'}</h1>
        <p>
          {register
            ? 'Create an account to manage orders and checkout.'
            : 'Log in to manage your orders and account.'}
        </p>

        {/* Conditional Full Name Input Element */}
        {register && (
          <label>
            Full name
            <input
              required
              minLength="2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>
        )}

        {/* Base Identity Fields */}
        <label>
          Email address
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            minLength="8"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={register ? 'new-password' : 'current-password'}
          />
          <small>At least 8 characters.</small>
        </label>

        {/* Global Error Display Alert Box */}
        {error && <div className="notice error">{error}</div>}

        {/* Authentication Action Trigger */}
        <button className="button primary wide" disabled={busy}>
          {busy ? 'Please wait…' : register ? 'Create account' : 'Log in'}{' '}
          <LockKeyhole size={16} />
        </button>

        {/* Switch Framework Mode (Login / Signup Toggle) */}
        <p className="auth-switch">
          {register ? 'Already have an account?' : 'New to Savvy Energy?'}{' '}
          <button
            type="button"
            onClick={() => {
              setRegister(!register);
              setError('');
            }}
          >
            {register ? 'Log in' : 'Create an account'}
          </button>
        </p>

        {/* Cancel Action Link */}
        <Link className="back-link centered" to="/shop">
          Continue shopping
        </Link>
      </form>
    </main>
  );
}
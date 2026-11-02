import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { FullPageLoader, Spinner } from '../components/Feedback';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { firstError } from '../utils/format';

export default function Login() {
  useDocumentTitle('Sign in');

  const { login, isAuthenticated, initializing } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const destination = location.state?.from
    ? `${location.state.from.pathname || '/admin'}${location.state.from.search || ''}`
    : '/admin';

  if (initializing) return <FullPageLoader label="Checking your session…" />;
  if (isAuthenticated) return <Navigate to={destination} replace />;

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!values.email.trim() || !values.password) {
      setError('Enter your email and password to continue.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const user = await login({
        email: values.email.trim(),
        password: values.password,
      });
      notify(`Welcome back, ${user.username}.`, 'success');
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(firstError(requestError, 'Sign-in failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout index="01">
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-4 font-display text-[clamp(2.7rem,5vw,3.8rem)] font-light leading-[0.98] tracking-[-0.04em]">
        Sign in to
        <span className="block italic text-terracotta">your desk.</span>
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Manage the portfolio, publish a note, or read the messages that have come in.
      </p>

      {error && (
        <div
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
        <div>
          <label htmlFor="login-email" className="field-label">
            Email address
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={update('email')}
              placeholder="you@example.com"
              className="input !pl-10"
              required
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="login-password" className="text-[0.8rem] font-medium text-ink">
              Password
            </label>
            <span className="text-[0.68rem] text-muted">6+ characters</span>
          </div>
          <div className="relative">
            <LockKeyhole
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={values.password}
              onChange={update('password')}
              placeholder="Your password"
              className="input !pl-10 !pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-ink/5 hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5">
          {submitting ? <Spinner size={16} /> : null}
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {import.meta.env.DEV && (
        <div className="mt-5 rounded-xl border border-dashed border-line bg-cream/55 px-4 py-3">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-muted">
            Local demo account
          </p>
          <p className="mt-1.5 text-xs text-ink/70">
            admin@folio.dev · Admin123!
          </p>
        </div>
      )}

      <p className="mt-7 text-center text-sm text-muted">
        New here?{' '}
        <Link to="/register" className="font-medium text-ink underline decoration-line underline-offset-4 transition hover:decoration-ink">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

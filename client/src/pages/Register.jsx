import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { FullPageLoader, Spinner } from '../components/Feedback';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { firstError } from '../utils/format';

const INITIAL = { username: '', email: '', password: '', confirm: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]+$/;

export default function Register() {
  useDocumentTitle('Create account');

  const { register, isAuthenticated, initializing } = useAuth();
  const { notify } = useToast();

  const [values, setValues] = useState(INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => {
    const value = values.password;
    let score = 0;
    if (value.length >= 6) score += 1;
    if (value.length >= 10) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
    return score;
  }, [values.password]);

  if (initializing) return <FullPageLoader label="Checking your session…" />;
  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: '' }));
    }
    if (error) setError('');
  };

  const validate = () => {
    const next = {};
    const username = values.username.trim();
    const email = values.email.trim();

    if (!username) next.username = 'Choose a username.';
    else if (username.length < 3 || username.length > 30)
      next.username = 'Username must be 3–30 characters.';
    else if (!USERNAME_PATTERN.test(username))
      next.username = 'Use only letters, numbers, dots, hyphens, and underscores.';

    if (!email) next.email = 'Enter your email address.';
    else if (!EMAIL_PATTERN.test(email)) next.email = 'That email address doesn’t look right.';

    if (!values.password) next.password = 'Choose a password.';
    else if (values.password.length < 6) next.password = 'Use at least 6 characters.';

    if (!values.confirm) next.confirm = 'Confirm your password.';
    else if (values.confirm !== values.password) next.confirm = 'The passwords do not match.';

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await register({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      notify(`Your account is ready, ${user.username}.`, 'success');
    } catch (requestError) {
      setError(firstError(requestError, 'Could not create the account. Please try again.'));
      if (requestError.errors?.length) {
        const next = {};
        requestError.errors.forEach((item) => {
          next[item.field] = item.message;
        });
        setFieldErrors(next);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout index="02">
      <p className="eyebrow">Join the desk</p>
      <h1 className="mt-4 font-display text-[clamp(2.7rem,5vw,3.8rem)] font-light leading-[0.98] tracking-[-0.04em]">
        Create your
        <span className="block italic text-terracotta">account.</span>
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        An account lets you comment on journal entries and, if you are the site owner, manage
        the portfolio from the dashboard.
      </p>

      {error && (
        <div
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
        <div>
          <label htmlFor="register-username" className="field-label">
            Username
          </label>
          <div className="relative">
            <UserRound
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id="register-username"
              type="text"
              autoComplete="username"
              value={values.username}
              onChange={update('username')}
              placeholder="alexchen"
              className={`input !pl-10 ${fieldErrors.username ? 'input-error' : ''}`}
              aria-invalid={Boolean(fieldErrors.username)}
            />
          </div>
          {fieldErrors.username && <p className="field-error">{fieldErrors.username}</p>}
        </div>

        <div>
          <label htmlFor="register-email" className="field-label">
            Email address
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={update('email')}
              placeholder="you@example.com"
              className={`input !pl-10 ${fieldErrors.email ? 'input-error' : ''}`}
              aria-invalid={Boolean(fieldErrors.email)}
            />
          </div>
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="register-password" className="field-label">
            Password
          </label>
          <div className="relative">
            <LockKeyhole
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={values.password}
              onChange={update('password')}
              placeholder="At least 6 characters"
              className={`input !pl-10 !pr-11 ${fieldErrors.password ? 'input-error' : ''}`}
              aria-invalid={Boolean(fieldErrors.password)}
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
          {fieldErrors.password ? (
            <p className="field-error">{fieldErrors.password}</p>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <span
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      strength >= level
                        ? strength <= 2
                          ? 'bg-butter'
                          : 'bg-moss'
                        : 'bg-line'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-muted">
                {values.password
                  ? ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][strength]
                  : 'Strength'}
              </span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="register-confirm" className="field-label">
            Confirm password
          </label>
          <div className="relative">
            <LockKeyhole
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id="register-confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={values.confirm}
              onChange={update('confirm')}
              placeholder="Repeat your password"
              className={`input !pl-10 ${fieldErrors.confirm ? 'input-error' : ''}`}
              aria-invalid={Boolean(fieldErrors.confirm)}
            />
          </div>
          {fieldErrors.confirm && <p className="field-error">{fieldErrors.confirm}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5">
          {submitting ? <Spinner size={16} /> : null}
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-5 text-center text-[0.7rem] leading-relaxed text-muted">
        By creating an account you agree to keep the conversation generous and the comments
        human.
      </p>

      <p className="mt-5 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-ink underline decoration-line underline-offset-4 transition hover:decoration-ink"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, Info, Eye, EyeOff } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import { Field, Input, Button } from '../../components/ui/index.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_HOME } from '../../lib/constants.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const expired = params.get('expired');

  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(ROLE_HOME[user.role] || '/', { replace: true });
    } catch (err) {
      setError(err.friendlyMessage || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const quickFill = (email) => setForm({ email, password: 'Password@123' });

  return (
    <AuthShell>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-plum">Sign in to your workspace</h2>
        <p className="mt-1 text-sm text-slateblue-500">
          Enter your enterprise credentials to continue.
        </p>
      </div>

      {expired && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          <Info size={16} /> Your session expired. Please sign in again.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email address" required>
          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slateblue-300" />
            <Input
              type="email"
              name="email"
              autoComplete="email"
              required
              className="pl-9"
              placeholder="you@itsmdeskpro.com"
              value={form.email}
              onChange={onChange}
            />
          </div>
        </Field>

        <Field label="Password" required>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slateblue-300" />
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              required
              className="pl-9 pr-10"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slateblue-400 hover:text-slateblue-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <label className="flex items-center gap-2 text-sm text-slateblue-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-slateblue-300 text-cyanaccent-500 focus:ring-cyanaccent-400"
          />
          Remember me
        </label>

        <Button type="submit" className="w-full" disabled={submitting}>
          <LogIn size={18} /> {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slateblue-500">
        New here?{' '}
        <Link to="/register" className="font-semibold text-cyanaccent-600 hover:underline">
          Register a new account
        </Link>
      </p>

    </AuthShell>
  );
}

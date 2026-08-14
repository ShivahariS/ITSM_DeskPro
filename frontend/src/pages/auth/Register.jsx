import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import { Field, Input, Select, Button } from '../../components/ui/index.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  ROLE_OPTIONS, ROLE_LABELS, DEPARTMENTS, LOCATIONS,
} from '../../lib/constants.js';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
    department: '', locationID: '', role: 'END_USER',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onChange = (e) => {
    let { name, value } = e.target;
    if (name === 'name') {
      value = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
    } else if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'password' || name === 'confirm') {
      value = value.slice(0, 20);
    }
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const er = {};

    const nameTrimmed = form.name.trim();
    if (!nameTrimmed) {
      er.name = 'Full name is required.';
    } else if (nameTrimmed.length > 50) {
      er.name = 'Full name cannot exceed 50 characters.';
    } else if (!/^[a-zA-Z\s]+$/.test(nameTrimmed)) {
      er.name = 'Full name must contain alphabets only.';
    }

    const emailTrimmed = form.email.trim();
    if (!emailTrimmed) {
      er.email = 'Email is required.';
    } else if (!emailRe.test(form.email)) {
      er.email = 'Enter a valid email address.';
    } else if (!emailTrimmed.toLowerCase().endsWith('@itsmdeskpro.com')) {
      er.email = 'Enterprise email must end with @itsmdeskpro.com.';
    }

    const phoneTrimmed = form.phone.trim();
    if (!phoneTrimmed) {
      er.phone = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(phoneTrimmed)) {
      er.phone = 'Phone number must be exactly 10 digits.';
    }

    if (!form.password) {
      er.password = 'Password is required.';
    } else if (form.password.length <= 6) {
      er.password = 'Password must be more than 6 characters.';
    } else if (form.password.length > 20) {
      er.password = 'Password cannot exceed 20 characters.';
    }

    if (form.confirm !== form.password) {
      er.confirm = 'Passwords do not match.';
    }

    if (!form.role) {
      er.role = 'Select an account role.';
    }

    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Note: the backend RegisterRequest has no `department` field, so it is
      // collected for onboarding context but not persisted.
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        phone: form.phone.trim() || null,
        locationID: form.locationID || null,
      });
      setSuccess(true);
      toast.success('Account created! You can now sign in.');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      const msg = err.friendlyMessage || 'Registration failed.';
      if (/email/i.test(msg)) setErrors((er) => ({ ...er, email: msg }));
      else setErrors((er) => ({ ...er, form: msg }));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <AuthShell>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <CheckCircle2 className="mx-auto mb-3 text-emerald-500" size={40} />
          <h2 className="text-xl font-bold text-plum">Account created</h2>
          <p className="mt-2 text-sm text-slateblue-600">
            Redirecting you to sign in…
          </p>
          <Link to="/login" className="mt-4 inline-block font-semibold text-cyanaccent-600 hover:underline">
            Go to login now
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-plum">Create your account</h2>
        <p className="mt-1 text-sm text-slateblue-500">
          Register to raise requests, report incidents and track resolutions.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Full name" required error={errors.name}>
          <Input name="name" value={form.name} onChange={onChange} placeholder="Jane Doe" maxLength={50} />
        </Field>

        <Field label="Enterprise email" required error={errors.email}>
          <Input name="email" type="email" value={form.email} onChange={onChange} placeholder="jane.doe@itsmdeskpro.com" />
        </Field>

        <Field label="Phone number" required error={errors.phone}>
          <Input name="phone" value={form.phone} onChange={onChange} placeholder="1234567890" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Password" required error={errors.password}>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                className="pr-10"
                maxLength={20}
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
          <Field label="Confirm password" required error={errors.confirm}>
            <div className="relative">
              <Input
                name="confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirm}
                onChange={onChange}
                placeholder="••••••••"
                className="pr-10"
                maxLength={20}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slateblue-400 hover:text-slateblue-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Department">
            <Select name="department" value={form.department} onChange={onChange} placeholder="Select…" options={DEPARTMENTS} />
          </Field>
          <Field label="Location">
            <Select name="locationID" value={form.locationID} onChange={onChange} placeholder="Select…" options={LOCATIONS} />
          </Field>
        </div>

        <Field label="Account role" required error={errors.role} hint="Defaults to End User.">
          <Select
            name="role"
            value={form.role}
            onChange={onChange}
            options={ROLE_OPTIONS.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
          />
        </Field>

        {errors.form && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.form}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          <UserPlus size={18} /> {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slateblue-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-cyanaccent-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

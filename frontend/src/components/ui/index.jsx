import { Loader2, ChevronRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
export function Button({ variant = 'primary', size, className = '', children, ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  };
  return (
    <button className={`${variants[variant] || 'btn-primary'} ${size === 'sm' ? 'btn-sm' : ''} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
export function Card({ className = '', hover = false, children, ...props }) {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slateblue-100 px-5 py-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 rounded-lg bg-mint p-2 text-plum">
            <Icon size={18} />
          </span>
        )}
        <div>
          <h3 className="text-base font-semibold text-plum">{title}</h3>
          {subtitle && <p className="text-sm text-slateblue-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCard — key metric tile (accent highlight per palette)
// ---------------------------------------------------------------------------
export function StatCard({ label, value, icon: Icon, hint, tone = 'accent' }) {
  const tones = {
    accent: 'text-plum',
    danger: 'text-red-600',
    warn: 'text-amber-600',
    success: 'text-emerald-600',
  };
  return (
    <Card className="p-5" hover>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slateblue-600">{label}</p>
        {Icon && (
          <span className="rounded-lg bg-mint p-2 text-cyanaccent-600">
            <Icon size={18} />
          </span>
        )}
      </div>
      <p className={`mt-2 text-3xl font-extrabold ${tones[tone] || tones.accent}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slateblue-400">{hint}</p>}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------
export function Badge({ className = '', children }) {
  return <span className={`badge ${className}`}>{children}</span>;
}

// ---------------------------------------------------------------------------
// Spinner / loading / empty / error states
// ---------------------------------------------------------------------------
export function Spinner({ className = '' }) {
  return <Loader2 className={`animate-spin text-cyanaccent-500 ${className}`} />;
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slateblue-500">
      <Spinner className="h-7 w-7" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      {Icon && (
        <span className="rounded-full bg-mint p-3 text-slateblue-400">
          <Icon size={26} />
        </span>
      )}
      <p className="text-base font-semibold text-plum">{title}</p>
      {message && <p className="max-w-sm text-sm text-slateblue-500">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = 'Failed to load data.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <p className="text-sm font-medium text-red-600">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress bar (seat utilisation etc.)
// ---------------------------------------------------------------------------
export function ProgressBar({ value = 0, className = '' }) {
  const clamped = Math.max(0, Math.min(100, value));
  const tone = clamped >= 90 ? 'bg-red-500' : clamped >= 75 ? 'bg-amber-500' : 'bg-cyanaccent-500';
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slateblue-100 ${className}`}>
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page header
// ---------------------------------------------------------------------------
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-plum">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slateblue-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form controls
// ---------------------------------------------------------------------------
export function Field({ label, error, required, children, hint }) {
  return (
    <div>
      {label && (
        <label className="label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slateblue-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Input({ className = '', ...props }) {
  return <input className={`input ${className}`} {...props} />;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`textarea ${className}`} {...props} />;
}

export function Select({ className = '', options = [], placeholder, children, ...props }) {
  return (
    <select className={`select ${className}`} {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {children ||
        options.map((opt) => {
          const value = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
    </select>
  );
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-slateblue-100">
      {tabs.map((tab) => {
        const value = typeof tab === 'object' ? tab.value : tab;
        const label = typeof tab === 'object' ? tab.label : tab;
        const isActive = value === active;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? 'border-cyanaccent-500 text-plum'
                : 'border-transparent text-slateblue-400 hover:text-slateblue-700'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export { ChevronRight };

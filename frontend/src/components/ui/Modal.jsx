import { useEffect } from 'react';
import { X } from 'lucide-react';

// Modal with a plum header per palette spec.
export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-plum-900/40 p-4 backdrop-blur-sm">
      <div className={`card my-8 w-full ${sizes[size] || sizes.md}`} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between rounded-t-xl bg-plum px-5 py-4 text-white">
          <div>
            <h3 className="text-base font-semibold">{title}</h3>
            {subtitle && <p className="text-xs text-mint/80">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-mint hover:bg-plum-600" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slateblue-100 px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { X } from 'lucide-react';

// Right-side slide-over drawer for detail views.
export default function Drawer({ open, onClose, title, subtitle, children, footer, width = 'max-w-xl' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-plum-900/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className={`relative flex h-full w-full flex-col bg-white shadow-2xl ${width}`} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between bg-plum px-5 py-4 text-white">
          <div>
            <h3 className="text-base font-semibold">{title}</h3>
            {subtitle && <p className="text-xs text-mint/80">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-mint hover:bg-plum-600" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slateblue-100 px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { NAV, ROLE_LABELS } from '../../lib/constants.js';
import { initials } from '../../lib/format.js';

export default function Sidebar({ open, onNavigate }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = NAV[role] || [];

  const handleLogout = () => {
    logout();
    onNavigate();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-plum text-white transition-transform lg:static lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-0 border-b border-white/10 px-5 py-5">
        <img src="/Logo.png" alt="ITSMDeskPro Logo" className="h-12 w-12 object-contain rounded-xl -mr-2" />
        <div className="leading-tight">
          <p className="text-lg font-extrabold tracking-tight">ITSMDeskPro</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-cyanaccent-300">
            {ROLE_LABELS[role] || 'Workspace'}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyanaccent-300 text-plum shadow-sm'
                    : 'text-mint/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User button & profile menu */}
      <div className="relative border-t border-white/10 px-4 py-3">
        <button
          className="flex w-full items-center gap-2 rounded-lg py-1.5 px-2 hover:bg-white/10 text-white"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyanaccent-300 text-sm font-bold text-plum">
            {initials(user?.name)}
          </span>
          <span className="text-left leading-tight block flex-1 truncate">
            <span className="block text-sm font-semibold truncate">{user?.name}</span>
            <span className="block text-[11px] text-mint/70 truncate">{ROLE_LABELS[role]}</span>
          </span>
          <ChevronDown size={16} className="text-mint/70 shrink-0" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute bottom-full left-4 z-20 mb-2 w-56 overflow-hidden rounded-lg border border-slateblue-100 bg-white text-gray-700 shadow-cardhover">
              <div className="border-b border-slateblue-100 px-4 py-3">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onNavigate();
                    navigate('/profile');
                  }}
                  className="text-left font-semibold text-plum hover:text-cyanaccent-600 hover:underline block text-sm focus:outline-none"
                >
                  {user?.name}
                </button>
                <p className="truncate text-xs text-slateblue-500">{user?.email}</p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-cyanaccent-600">
                  {ROLE_LABELS[role]}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-mint"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

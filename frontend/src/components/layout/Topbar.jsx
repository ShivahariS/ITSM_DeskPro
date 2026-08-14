import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { NAV } from '../../lib/constants.js';
import { getUnreadCount } from '../../api/notifications.js';

export default function Topbar({ onMenu }) {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  // Poll unread count every 30s (and once on mount).
  useEffect(() => {
    let active = true;
    const load = () => getUnreadCount().then((c) => active && setUnread(c)).catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const notificationsRoute =
    (NAV[role] || []).find((i) => i.label === 'Notifications')?.to || null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slateblue-100 bg-plum px-4 py-3 text-white">
      <div className="flex items-center gap-3">
        <button className="rounded-md p-1.5 hover:bg-plum-600 lg:hidden" onClick={onMenu} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <span className="hidden text-sm font-medium text-mint/80 sm:block">
          IT Service Management &amp; Help Desk
        </span>
      </div>

      <div className="flex items-center gap-2">
        {notificationsRoute && (
          <button
            className="relative rounded-lg p-2 hover:bg-plum-600"
            onClick={() => navigate(notificationsRoute)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-cyanaccent-300 px-1 text-[11px] font-bold text-plum">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-mint">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-plum-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

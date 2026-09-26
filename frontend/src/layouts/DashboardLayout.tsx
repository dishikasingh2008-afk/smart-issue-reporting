import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FilePlus2, ListChecks, Bell, User as UserIcon, LogOut,
  Users, Tags, BarChart3, Menu, X, School, Trophy, Vote, QrCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const studentLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/report-issue', label: 'Report Issue', icon: FilePlus2 },
  { to: '/my-issues', label: 'My Issues', icon: ListChecks },
  { to: '/polls', label: 'Polls', icon: Vote },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: UserIcon },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/issues', label: 'All Issues', icon: ListChecks },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/polls', label: 'Polls', icon: Vote },
  { to: '/admin/qr-codes', label: 'QR Codes', icon: QrCode },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: UserIcon },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const links = user?.role === 'ADMIN' ? adminLinks : studentLinks;

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      api.get('/notifications').then((res) => {
        setUnread(res.data.data.filter((n: any) => !n.isRead).length);
      }).catch(() => {});
    }
  }, [user]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-black px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2 font-bold text-white">
          <School size={22} /> Smart Campus
        </div>
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={24} className="text-white" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-primary-700">
          <SidebarContent links={links} user={user} onLogout={handleLogout} unread={unread} />
        </aside>

        {/* Sidebar - mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 bg-primary-700 shadow-xl">
              <div className="flex justify-end p-3">
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={22} className="text-white" />
                </button>
              </div>
              <SidebarContent links={links} user={user} onLogout={handleLogout} unread={unread} onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <main className="flex-1 lg:pl-64">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ links, user, onLogout, unread, onNavigate }: any) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-6 font-bold text-white text-lg">
        <School size={24} /> Smart Campus
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((link: any) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard' || link.to === '/admin'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-wine-600 text-white' : 'text-white/70 hover:bg-black/20 hover:text-white'
              }`
            }
          >
            <span className="flex items-center gap-3">
              <link.icon size={18} />
              {link.label}
            </span>
            {link.label === 'Notifications' && unread > 0 && (
              <span className="rounded-full bg-black px-1.5 py-0.5 text-[10px] font-bold text-white">{unread}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
            <p className="truncate text-xs text-white/60">{user?.role === 'ADMIN' ? 'Campus Staff' : 'Student'}</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-black/20 hover:text-white">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}

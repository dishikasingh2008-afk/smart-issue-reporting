import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellOff } from 'lucide-react';
import { api } from '../services/api';
import { Notification } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then((res) => setNotifications(res.data.data)).finally(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await api.put(`/notifications/${id}/read`);
    } catch {
      // revert silently on failure
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>

      {notifications.length === 0 ? (
        <EmptyState icon={<BellOff size={40} />} title="No notifications yet" description="You'll be notified here when your issue status changes." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`card flex items-start gap-3 p-4 ${!n.isRead ? 'border-l-4 border-l-primary-500' : ''}`}>
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!n.isRead ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
                <Bell size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${!n.isRead ? 'font-medium text-slate-800' : 'text-slate-600'}`}>{n.message}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                  {n.issue && <Link to={`/issues/${n.issue.id}`} className="font-semibold text-primary-600 hover:underline">View Issue</Link>}
                </div>
              </div>
              {!n.isRead && (
                <button onClick={() => markRead(n.id)} className="shrink-0 text-xs font-semibold text-primary-600 hover:underline">
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

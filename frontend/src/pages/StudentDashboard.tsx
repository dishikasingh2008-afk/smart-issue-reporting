import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilePlus2, ClipboardList, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Issue } from '../types';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/issues?limit=100').then((res) => setIssues(res.data.data)).finally(() => setLoading(false));
  }, []);

  const total = issues.length;
  const reported = issues.filter((i) => i.status === 'REPORTED').length;
  const inProgress = issues.filter((i) => i.status === 'IN_PROGRESS').length;
  const resolved = issues.filter((i) => i.status === 'RESOLVED').length;
  const recent = issues.slice(0, 5);

  const cards = [
    { label: 'Total Reports', value: total, icon: ClipboardList, color: 'bg-primary-50 text-primary-600' },
    { label: 'Reported', value: reported, icon: FilePlus2, color: 'bg-amber-50 text-amber-600' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'bg-blue-50 text-blue-600' },
    { label: 'Resolved', value: resolved, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
  ];

  if (loading) return <LoadingSpinner label="Loading your dashboard..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-slate-500">Here's an overview of your reported issues.</p>
        </div>
        <Link to="/report-issue" className="btn-primary">
          <FilePlus2 size={18} /> Report Issue
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${c.color}`}>
              <c.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="text-sm text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Issues</h2>
          <Link to="/my-issues" className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            title="No issues reported yet"
            description="Start by reporting your first campus issue."
            action={<Link to="/report-issue" className="btn-primary mt-3">Report an Issue</Link>}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((issue) => (
              <Link key={issue.id} to={`/issues/${issue.id}`} className="flex items-center justify-between gap-4 py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">{issue.title}</p>
                  <p className="text-xs text-slate-500">{issue.displayId} · {issue.building}, Floor {issue.floor}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <PriorityBadge priority={issue.priority} />
                  <StatusBadge status={issue.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

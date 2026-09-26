import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Inbox } from 'lucide-react';
import { api } from '../services/api';
import { Issue, Pagination } from '../types';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const categories = ['Electrical', 'Plumbing', 'Furniture', 'Cleanliness', 'Internet/WiFi', 'Infrastructure', 'Security', 'Other'];

export default function ManageIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '10', page: String(page) });
    if (status) params.set('status', status);
    if (category) params.set('category', category);
    if (priority) params.set('priority', priority);
    if (search) params.set('search', search);
    const timeout = setTimeout(() => {
      api.get(`/issues?${params.toString()}`).then((res) => {
        setIssues(res.data.data);
        setPagination(res.data.pagination);
      }).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, status, category, priority, page]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Manage Issues</h1>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input-field pl-9" placeholder="Search issues..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input-field sm:w-40" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="REPORTED">Reported</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <select className="input-field sm:w-44" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input-field sm:w-36" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : issues.length === 0 ? (
        <EmptyState icon={<Inbox size={40} />} title="No issues found" description="Try adjusting your filters." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Upvotes</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reporter</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{issue.displayId}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{issue.title}</td>
                  <td className="px-4 py-3 text-slate-600">{issue.category}</td>
                  <td className="px-4 py-3 text-slate-600">{issue.building}, F{issue.floor}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={issue.priority} /></td>
                  <td className="px-4 py-3 font-medium text-slate-600">{issue.upvoteCount ?? 0}</td>
                  <td className="px-4 py-3"><StatusBadge status={issue.status} /></td>
                  <td className="px-4 py-3 text-slate-600">{issue.reporter?.name}</td>
                  <td className="px-4 py-3 text-slate-500">{issue.assignedTo?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(issue.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/issues/${issue.id}`} className="font-semibold text-primary-600 hover:underline">Manage</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
              <p className="text-slate-500">Page {pagination.page} of {pagination.totalPages} ({pagination.total} issues)</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary px-3 py-1.5 disabled:opacity-40">Prev</button>
                <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary px-3 py-1.5 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

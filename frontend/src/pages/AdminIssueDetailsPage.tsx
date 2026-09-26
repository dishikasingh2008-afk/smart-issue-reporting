import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, User, Calendar, Info, Loader2, ThumbsUp } from 'lucide-react';
import { api, getErrorMessage, UPLOADS_BASE_URL } from '../services/api';
import { Issue, IssueStatus, Priority } from '../types';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';

export default function AdminIssueDetailsPage() {
  const { id } = useParams();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<{ id: string; name: string }[]>([]);
  const [comment, setComment] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    api.get(`/issues/${id}`).then((res) => setIssue(res.data.data)).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    api.get('/users').then((res) => setStaff(res.data.data.filter((u: any) => u.role === 'ADMIN')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function updateStatus(status: IssueStatus) {
    setSaving(true);
    try {
      await api.put(`/issues/${id}/status`, { status, comment: statusComment || undefined });
      toast.success(`Status updated to ${status.replace('_', ' ')}.`);
      setStatusComment('');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function updatePriority(priority: Priority) {
    setSaving(true);
    try {
      await api.put(`/issues/${id}/priority`, { priority });
      toast.success(`Priority updated to ${priority}.`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function assign(staffId: string) {
    setSaving(true);
    try {
      await api.put(`/issues/${id}/assign`, { assignedToId: staffId || null });
      toast.success('Assignment updated.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setSaving(true);
    try {
      await api.post(`/issues/${id}/comments`, { comment });
      toast.success('Comment added.');
      setComment('');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading issue..." />;
  if (!issue) return <p className="py-16 text-center text-slate-500">Issue not found.</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/admin/issues" className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Back to All Issues
      </Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-400">{issue.displayId}</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">{issue.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={issue.priority} />
            <StatusBadge status={issue.status} />
            <span className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">
              <ThumbsUp size={13} /> {issue.upvoteCount || 0} upvotes
            </span>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-700">{issue.description}</p>
        {issue.rating && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-emerald-50 p-3">
            <StarRating value={issue.rating.stars} readOnly size={16} />
            <p className="text-sm text-emerald-800">{issue.rating.comment ? `"${issue.rating.comment}"` : 'Student rated this resolution.'}</p>
          </div>
        )}
        {issue.imageUrl && <img src={`${UPLOADS_BASE_URL}${issue.imageUrl}`} alt="Issue" className="mt-4 max-h-96 w-full rounded-lg object-cover" />}

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <InfoRow icon={Info} label="Category" value={issue.category} />
          <InfoRow icon={MapPin} label="Location" value={`${issue.building}, Floor ${issue.floor}${issue.room ? `, Room ${issue.room}` : ''}${issue.area ? ` (${issue.area})` : ''}`} />
          <InfoRow icon={User} label="Reported by" value={`${issue.reporter?.name} (${issue.reporter?.email})`} />
          <InfoRow icon={Calendar} label="Reported on" value={new Date(issue.createdAt).toLocaleString()} />
        </div>
        {issue.priorityReason && (
          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <span className="font-semibold">Priority reason: </span>{issue.priorityReason}
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-3 font-semibold text-slate-900">Change Status</h2>
          <textarea className="input-field mb-3" rows={2} placeholder="Optional comment for the student" value={statusComment} onChange={(e) => setStatusComment(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {(['REPORTED', 'IN_PROGRESS', 'RESOLVED'] as IssueStatus[]).map((s) => (
              <button key={s} disabled={saving || issue.status === s} onClick={() => updateStatus(s)} className="btn-secondary disabled:opacity-40">
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-3 font-semibold text-slate-900">Change Priority</h2>
          <div className="flex flex-wrap gap-2">
            {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map((p) => (
              <button key={p} disabled={saving || issue.priority === p} onClick={() => updatePriority(p)} className="btn-secondary disabled:opacity-40">
                {p}
              </button>
            ))}
          </div>

          <h2 className="mb-3 mt-6 font-semibold text-slate-900">Assign Staff</h2>
          <select className="input-field" value={issue.assignedToId || ''} onChange={(e) => assign(e.target.value)} disabled={saving}>
            <option value="">Unassigned</option>
            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Status History & Comments</h2>
        {!issue.statusHistory || issue.statusHistory.length === 0 ? (
          <p className="text-sm text-slate-500">No history yet.</p>
        ) : (
          <ul className="mb-5 space-y-3">
            {[...issue.statusHistory].reverse().map((h) => (
              <li key={h.id} className="border-b border-slate-50 pb-3 text-sm last:border-0">
                <p className="text-slate-700">{h.newStatus.replace('_', ' ')} {h.comment && `— "${h.comment}"`}</p>
                <p className="text-xs text-slate-400">{h.changedBy.name} · {new Date(h.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={submitComment} className="flex gap-2">
          <input className="input-field" placeholder="Add a comment for the student..." value={comment} onChange={(e) => setComment(e.target.value)} />
          <button type="submit" disabled={saving} className="btn-primary shrink-0">
            {saving && <Loader2 size={16} className="animate-spin" />} Add
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={16} className="mt-0.5 shrink-0 text-slate-400" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, User, Calendar, Info, CheckCircle2, Clock, FileText, Loader2 } from 'lucide-react';
import { api, getErrorMessage, UPLOADS_BASE_URL } from '../services/api';
import { Issue } from '../types';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import UpvoteButton from '../components/UpvoteButton';
import StarRating from '../components/StarRating';

const STAGES: Array<Issue['status']> = ['REPORTED', 'IN_PROGRESS', 'RESOLVED'];

export default function IssueDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    api.get(`/issues/${id}`)
      .then((res) => setIssue(res.data.data))
      .catch(() => setError('This issue could not be found or you do not have access to it.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function submitRating(e: React.FormEvent) {
    e.preventDefault();
    if (!issue || ratingValue === 0) return;
    setSubmittingRating(true);
    try {
      const res = await api.post(`/issues/${issue.id}/rating`, { stars: ratingValue, comment: ratingComment || undefined });
      setIssue({ ...issue, rating: res.data.data });
      toast.success('Thanks for rating this fix!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingRating(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading issue details..." />;
  if (error || !issue) return <p className="py-16 text-center text-slate-500">{error}</p>;

  const stageIndex = STAGES.indexOf(issue.status);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to=".." relative="path" className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Back
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
            {issue.reporterId !== user?.id && (
              <UpvoteButton issueId={issue.id} upvoteCount={issue.upvoteCount || 0} hasUpvoted={!!issue.hasUpvoted} />
            )}
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-700">{issue.description}</p>

        {issue.imageUrl && (
          <img src={`${UPLOADS_BASE_URL}${issue.imageUrl}`} alt="Issue" className="mt-4 max-h-96 w-full rounded-lg object-cover" />
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <InfoRow icon={Info} label="Category" value={issue.category} />
          <InfoRow icon={MapPin} label="Location" value={`${issue.building}, Floor ${issue.floor}${issue.room ? `, Room ${issue.room}` : ''}${issue.area ? ` (${issue.area})` : ''}`} />
          <InfoRow icon={User} label="Reported by" value={issue.reporter?.name || '—'} />
          <InfoRow icon={Calendar} label="Reported on" value={new Date(issue.createdAt).toLocaleString()} />
          {issue.assignedTo && <InfoRow icon={User} label="Assigned to" value={issue.assignedTo.name} />}
        </div>

        {issue.priorityReason && (
          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <span className="font-semibold">Why this priority? </span>{issue.priorityReason}
          </div>
        )}
      </div>

      {/* Status timeline */}
      <div className="card p-6">
        <h2 className="mb-5 font-semibold text-slate-900">Status Timeline</h2>
        <div className="flex items-center">
          {STAGES.map((stage, i) => (
            <div key={stage} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${i <= stageIndex ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {i < stageIndex ? <CheckCircle2 size={18} /> : i === stageIndex ? <Clock size={18} /> : <span className="text-xs">{i + 1}</span>}
                </div>
                <p className={`mt-2 text-xs font-medium ${i <= stageIndex ? 'text-slate-800' : 'text-slate-400'}`}>
                  {stage === 'IN_PROGRESS' ? 'In Progress' : stage.charAt(0) + stage.slice(1).toLowerCase()}
                </p>
              </div>
              {i < STAGES.length - 1 && <div className={`mx-2 h-0.5 flex-1 ${i < stageIndex ? 'bg-primary-600' : 'bg-slate-100'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* History / comments */}
      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><FileText size={18} /> Status History & Comments</h2>
        {!issue.statusHistory || issue.statusHistory.length === 0 ? (
          <p className="text-sm text-slate-500">No history yet.</p>
        ) : (
          <ul className="space-y-4">
            {[...issue.statusHistory].reverse().map((h) => (
              <li key={h.id} className="flex gap-3 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-400" />
                <div>
                  <p className="text-sm text-slate-700">
                    {h.oldStatus && h.oldStatus !== h.newStatus ? (
                      <>Status changed to <StatusBadge status={h.newStatus} /></>
                    ) : (
                      <span className="font-medium">{h.newStatus === 'REPORTED' && !h.oldStatus ? 'Issue reported' : 'Comment added'}</span>
                    )}
                  </p>
                  {h.comment && <p className="mt-1 text-sm text-slate-500">"{h.comment}"</p>}
                  <p className="mt-1 text-xs text-slate-400">{h.changedBy.name} · {new Date(h.createdAt).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Post-resolution rating */}
      {issue.status === 'RESOLVED' && issue.reporterId === user?.id && (
        <div className="card p-6">
          <h2 className="mb-3 font-semibold text-slate-900">Rate How This Was Handled</h2>
          {issue.rating ? (
            <div>
              <StarRating value={issue.rating.stars} readOnly />
              {issue.rating.comment && <p className="mt-2 text-sm text-slate-600">"{issue.rating.comment}"</p>}
              <p className="mt-1 text-xs text-slate-400">Thanks for your feedback!</p>
            </div>
          ) : (
            <form onSubmit={submitRating} className="space-y-3">
              <StarRating value={ratingValue} onChange={setRatingValue} size={28} />
              <textarea
                className="input-field"
                rows={2}
                placeholder="Optional comment about how this was resolved..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
              />
              <button type="submit" disabled={ratingValue === 0 || submittingRating} className="btn-primary">
                {submittingRating && <Loader2 size={16} className="animate-spin" />} Submit Rating
              </button>
            </form>
          )}
        </div>
      )}
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

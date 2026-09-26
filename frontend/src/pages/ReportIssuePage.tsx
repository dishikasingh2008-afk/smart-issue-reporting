import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, ImagePlus, X, CheckCircle2, Users } from 'lucide-react';
import { api, getErrorMessage } from '../services/api';
import { DuplicateMatch } from '../types';
import UpvoteButton from '../components/UpvoteButton';

const CATEGORIES_HINT = ['Electrical', 'Plumbing / Water Leakage', 'Furniture', 'Cleanliness', 'Internet / WiFi', 'Infrastructure', 'Security', 'Other'];

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState(searchParams.get('building') || '');
  const [floor, setFloor] = useState(searchParams.get('floor') || '');
  const [room, setRoom] = useState(searchParams.get('room') || '');
  const [area, setArea] = useState(searchParams.get('area') || '');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [dismissedDuplicates, setDismissedDuplicates] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Duplicate detection: before creating an issue, check for overlapping open issues
  // in the same building/floor so a student can upvote instead of filing a duplicate.
  useEffect(() => {
    setDismissedDuplicates(false);
    if (title.trim().length < 3 || !building.trim() || !floor.trim()) {
      setDuplicates([]);
      return;
    }
    const timeout = setTimeout(() => {
      api.post('/issues/check-duplicates', { title, description, building, floor })
        .then((res) => setDuplicates(res.data.data))
        .catch(() => {});
    }, 500);
    return () => clearTimeout(timeout);
  }, [title, description, building, floor]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Only JPG, JPEG or PNG images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB.');
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Submitting issue...');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('building', building);
      formData.append('floor', floor);
      if (room) formData.append('room', room);
      if (area) formData.append('area', area);
      if (image) formData.append('image', image);

      const res = await api.post('/issues', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const issue = res.data.data;
      toast.success(`Issue reported successfully! Your issue ID is #${issue.displayId}.`, { id: toastId });
      setSubmittedId(issue.id);
    } catch (err) {
      toast.error(getErrorMessage(err), { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  if (submittedId) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={56} />
        <h1 className="text-xl font-bold text-slate-900">Issue submitted successfully!</h1>
        <p className="mt-2 text-sm text-slate-500">Our system has automatically categorized and prioritized your report. You can track its progress anytime.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="btn-secondary" onClick={() => navigate('/my-issues')}>View My Issues</button>
          <button className="btn-primary" onClick={() => navigate(`/issues/${submittedId}`)}>View Details</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Report an Issue</h1>
      <p className="mt-1 text-sm text-slate-500">
        Describe the problem — our system automatically detects category and priority (e.g. {CATEGORIES_HINT.join(', ')}).
      </p>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-5 p-6">
        <div>
          <label className="label-text">Title</label>
          <input required minLength={3} className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Water leaking near lab entrance" />
        </div>
        <div>
          <label className="label-text">Description</label>
          <textarea required minLength={10} rows={4} className="input-field" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what's wrong in detail — this helps us auto-detect category and priority." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Building</label>
            <input required className="input-field" value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="Academic Block A" />
          </div>
          <div>
            <label className="label-text">Floor</label>
            <input required className="input-field" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="2" />
          </div>
          <div>
            <label className="label-text">Room (optional)</label>
            <input className="input-field" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="204" />
          </div>
          <div>
            <label className="label-text">Area (optional)</label>
            <input className="input-field" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Computer Lab" />
          </div>
        </div>

        <div>
          <label className="label-text">Photo (optional)</label>
          {preview ? (
            <div className="relative inline-block">
              <img src={preview} alt="Preview" className="h-40 w-40 rounded-lg border border-slate-200 object-cover" />
              <button type="button" onClick={removeImage} className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow-card">
                <X size={16} className="text-slate-600" />
              </button>
            </div>
          ) : (
            <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary-300 hover:text-primary-500">
              <ImagePlus size={24} />
              <span className="mt-2 text-sm">Click to upload (JPG/PNG, max 5MB)</span>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={handleFile} />
            </label>
          )}
        </div>

        {!dismissedDuplicates && duplicates.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <Users size={16} /> {duplicates.length} similar {duplicates.length === 1 ? 'issue was' : 'issues were'} already reported here — upvote instead?
              </p>
              <button type="button" onClick={() => setDismissedDuplicates(true)} className="text-xs font-semibold text-amber-700 hover:underline">
                It's different
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {duplicates.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 rounded-lg bg-white p-2.5 shadow-sm">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{d.title}</p>
                    <p className="text-xs text-slate-400">{d.displayId} · {d.building}, Floor {d.floor}</p>
                  </div>
                  <UpvoteButton issueId={d.id} upvoteCount={d.upvoteCount} hasUpvoted={false} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <Loader2 size={16} className="animate-spin" />} Submit Issue
        </button>
      </form>
    </div>
  );
}

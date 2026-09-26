import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
import { api, getErrorMessage } from '../services/api';
import { Poll } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function ManagePollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [creating, setCreating] = useState(false);

  function load() {
    api.get('/polls').then((res) => setPolls(res.data.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function updateOption(i: number, value: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  }
  function addOption() {
    if (options.length < 8) setOptions((prev) => [...prev, '']);
  }
  function removeOption(i: number) {
    if (options.length > 2) setOptions((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function createPoll(e: React.FormEvent) {
    e.preventDefault();
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (question.trim().length < 3 || cleanOptions.length < 2) {
      toast.error('Enter a question and at least 2 options.');
      return;
    }
    setCreating(true);
    try {
      await api.post('/polls', { question, options: cleanOptions });
      toast.success('Poll created.');
      setQuestion('');
      setOptions(['', '']);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function toggle(poll: Poll) {
    try {
      await api.put(`/polls/${poll.id}/toggle`, { isActive: !poll.isActive });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function remove(id: string) {
    try {
      await api.delete(`/polls/${id}`);
      toast.success('Poll deleted.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Manage Polls</h1>

      <form onSubmit={createPoll} className="card space-y-3 p-6">
        <h2 className="font-semibold text-slate-900">New Poll</h2>
        <input className="input-field" placeholder="What should be fixed next?" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="input-field" placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => updateOption(i, e.target.value)} />
              {options.length > 2 && (
                <button type="button" onClick={() => removeOption(i)} className="text-slate-400 hover:text-red-500">
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button type="button" onClick={addOption} disabled={options.length >= 8} className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline disabled:opacity-40">
            <Plus size={16} /> Add option
          </button>
          <button type="submit" disabled={creating} className="btn-primary">
            {creating && <Loader2 size={16} className="animate-spin" />} Create Poll
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : polls.length === 0 ? (
        <EmptyState title="No polls yet" description="Create your first poll above." />
      ) : (
        <div className="card divide-y divide-slate-100">
          {polls.map((poll) => (
            <div key={poll.id} className="space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800">{poll.question}</p>
                  <p className="text-xs text-slate-400">{poll.totalVotes} votes · {poll.isActive ? 'Active' : 'Closed'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggle(poll)} className="btn-secondary px-3 py-1.5 text-xs">
                    {poll.isActive ? 'Close Poll' : 'Reopen Poll'}
                  </button>
                  <button onClick={() => remove(poll.id)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                {poll.options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2 text-sm">
                    <span className="w-40 shrink-0 truncate text-slate-600">{opt.text}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-primary-600" style={{ width: `${opt.percentage}%` }} />
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs text-slate-500">{opt.percentage}% ({opt.voteCount})</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

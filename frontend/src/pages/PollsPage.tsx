import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Vote, CheckCircle2 } from 'lucide-react';
import { api, getErrorMessage } from '../services/api';
import { Poll } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);

  function load() {
    api.get('/polls').then((res) => setPolls(res.data.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function vote(pollId: string, optionId: string) {
    setVotingId(pollId);
    try {
      const res = await api.post(`/polls/${pollId}/vote`, { optionId });
      setPolls((prev) => prev.map((p) => (p.id === pollId ? res.data.data : p)));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setVotingId(null);
    }
  }

  if (loading) return <LoadingSpinner label="Loading polls..." />;

  const activePolls = polls.filter((p) => p.isActive);
  const closedPolls = polls.filter((p) => !p.isActive);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><Vote className="text-primary-600" /> Student Polls</h1>
        <p className="mt-1 text-sm text-slate-500">Vote on recurring campus decisions and see live results.</p>
      </div>

      {polls.length === 0 ? (
        <EmptyState title="No polls yet" description="Check back soon — campus staff post polls here for students to vote on." />
      ) : (
        <>
          {activePolls.map((poll) => <PollCard key={poll.id} poll={poll} onVote={vote} voting={votingId === poll.id} />)}
          {closedPolls.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Closed Polls</h2>
              <div className="space-y-4">
                {closedPolls.map((poll) => <PollCard key={poll.id} poll={poll} onVote={vote} voting={false} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PollCard({ poll, onVote, voting }: { poll: Poll; onVote: (pollId: string, optionId: string) => void; voting: boolean }) {
  const showResults = poll.hasVoted || !poll.isActive;

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-900">{poll.question}</h2>
        <span className="shrink-0 text-xs text-slate-400">{poll.totalVotes} vote{poll.totalVotes === 1 ? '' : 's'}</span>
      </div>

      <div className="space-y-2.5">
        {poll.options.map((opt) => (
          <div key={opt.id}>
            {showResults ? (
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className={`flex items-center gap-1.5 font-medium ${poll.votedOptionId === opt.id ? 'text-primary-700' : 'text-slate-700'}`}>
                    {poll.votedOptionId === opt.id && <CheckCircle2 size={14} />} {opt.text}
                  </span>
                  <span className="text-slate-500">{opt.percentage}% ({opt.voteCount})</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${opt.percentage}%` }} />
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={voting}
                onClick={() => onVote(poll.id, opt.id)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:border-primary-300 hover:bg-primary-50 disabled:opacity-50"
              >
                {opt.text}
              </button>
            )}
          </div>
        ))}
      </div>

      {!poll.isActive && <p className="mt-3 text-xs font-medium text-slate-400">This poll is closed.</p>}
    </div>
  );
}

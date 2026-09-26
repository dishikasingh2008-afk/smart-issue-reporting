import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { api } from '../services/api';
import { LeaderboardEntry } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard').then((res) => setEntries(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading leaderboard..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><Trophy className="text-amber-500" /> Campus Fixes Leaderboard</h1>
        <p className="mt-1 text-sm text-slate-500">Credits are earned for helping the campus — getting issues resolved, upvoting real problems, and rating fixes — not for filing the most complaints.</p>
      </div>

      {entries.length === 0 ? (
        <EmptyState title="No contributors yet" description="Be the first to earn credits by reporting, upvoting, and rating issues." />
      ) : (
        <div className="card divide-y divide-slate-100">
          {entries.map((e, i) => (
            <div key={e.userId} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-8 shrink-0 text-center text-xl">{MEDALS[i] || `#${i + 1}`}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800">{e.name} — {e.credits} credits</p>
                  <p className="text-xs text-slate-500">
                    {e.issuesResolved} resolved reports · {e.upvotesGiven} upvotes given · {e.ratingsGiven} ratings given
                  </p>
                </div>
              </div>
              {e.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {e.badges.map((b) => (
                    <span key={b} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{b}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

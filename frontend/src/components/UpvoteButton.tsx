import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../services/api';

export default function UpvoteButton({
  issueId,
  upvoteCount,
  hasUpvoted,
  disabled,
  onChange,
}: {
  issueId: string;
  upvoteCount: number;
  hasUpvoted: boolean;
  disabled?: boolean;
  onChange?: (upvoteCount: number, hasUpvoted: boolean) => void;
}) {
  const [count, setCount] = useState(upvoteCount);
  const [upvoted, setUpvoted] = useState(hasUpvoted);
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || loading) return;
    setLoading(true);
    try {
      const res = await api.post(`/issues/${issueId}/upvote`);
      setCount(res.data.data.upvoteCount);
      setUpvoted(res.data.data.hasUpvoted);
      onChange?.(res.data.data.upvoteCount, res.data.data.hasUpvoted);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      title={disabled ? "You can't upvote your own issue" : upvoted ? 'Remove your upvote' : 'Me too — upvote this issue'}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        upvoted ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-primary-200 hover:text-primary-700'
      }`}
    >
      <ThumbsUp size={14} className={upvoted ? 'fill-primary-600 text-primary-600' : ''} />
      Me too · {count}
    </button>
  );
}

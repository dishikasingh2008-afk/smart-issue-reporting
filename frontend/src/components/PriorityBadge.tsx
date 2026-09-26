import { Priority } from '../types';

const styles: Record<Priority, string> = {
  LOW: 'bg-slate-100 text-slate-600 ring-slate-200',
  MEDIUM: 'bg-orange-50 text-orange-700 ring-orange-200',
  HIGH: 'bg-red-50 text-red-700 ring-red-200',
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[priority]}`}>
      {priority}
    </span>
  );
}

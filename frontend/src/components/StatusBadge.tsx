import { IssueStatus } from '../types';

const styles: Record<IssueStatus, string> = {
  REPORTED: 'bg-amber-50 text-amber-700 ring-amber-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 ring-blue-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

const labels: Record<IssueStatus, string> = {
  REPORTED: 'Reported',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
};

export default function StatusBadge({ status }: { status: IssueStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

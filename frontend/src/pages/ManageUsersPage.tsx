import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users').then((res) => setUsers(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3">Reported Issues</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.role === 'ADMIN' ? 'bg-primary-50 text-primary-700' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-slate-600">{u.reportedIssueCount ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

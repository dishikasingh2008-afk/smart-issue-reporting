import { useEffect, useState } from 'react';
import { ClipboardList, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard').then((res) => setData(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading analytics..." />;
  if (!data) return null;

  const cards = [
    { label: 'Total Issues', value: data.totals.total, icon: ClipboardList, color: 'bg-primary-50 text-primary-600' },
    { label: 'Pending', value: data.totals.reported, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
    { label: 'In Progress', value: data.totals.inProgress, icon: Clock, color: 'bg-blue-50 text-blue-600' },
    { label: 'Resolved', value: data.totals.resolved, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'High Priority', value: data.totals.highPriority, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${c.color}`}>
              <c.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="text-sm text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Issues by Category</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.byCategory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Issues by Status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {data.byStatus.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Priority Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.byPriority} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Issues by Building</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.byBuilding}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 font-semibold text-slate-900">Monthly Issue Reports</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

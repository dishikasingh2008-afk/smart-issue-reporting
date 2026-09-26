import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { School, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-xl font-bold text-primary-700">
          <School size={26} /> Smart Campus
        </Link>
        <div className="card p-8">
          <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to report and track campus issues.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label-text">Email</label>
              <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@campus.com" />
            </div>
            <div>
              <label className="label-text">Password</label>
              <input type="password" required className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 size={16} className="animate-spin" />} Log in
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            <p className="font-semibold text-slate-600">Demo credentials</p>
            <p>Admin: admin@campus.com / Admin@123</p>
            <p>Student: student@campus.com / Student@123</p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account? <Link to="/register" className="font-semibold text-primary-600 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

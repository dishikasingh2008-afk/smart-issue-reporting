import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { School, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const user = await register(name, email, password);
      toast.success(`Account created! Welcome, ${user.name.split(' ')[0]}.`);
      navigate('/dashboard');
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
          <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Register as a student to start reporting issues.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label-text">Full name</label>
              <input required className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <label className="label-text">Email</label>
              <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@campus.com" />
            </div>
            <div>
              <label className="label-text">Password</label>
              <input type="password" required className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 size={16} className="animate-spin" />} Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-semibold text-primary-600 hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      <div className="card mt-6 p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{user.name}</p>
            <p className="text-sm text-slate-500">{user.role === 'ADMIN' ? 'Campus Staff / Admin' : 'Student'}</p>
          </div>
        </div>
        <dl className="divide-y divide-slate-100 text-sm">
          <div className="flex justify-between py-3"><dt className="text-slate-500">Email</dt><dd className="font-medium text-slate-800">{user.email}</dd></div>
          <div className="flex justify-between py-3"><dt className="text-slate-500">Role</dt><dd className="font-medium text-slate-800">{user.role}</dd></div>
          <div className="flex justify-between py-3"><dt className="text-slate-500">Member since</dt><dd className="font-medium text-slate-800">{new Date(user.createdAt).toLocaleDateString()}</dd></div>
        </dl>
      </div>
    </div>
  );
}

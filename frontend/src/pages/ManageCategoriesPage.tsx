import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { api, getErrorMessage } from '../services/api';
import { Category } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    api.get('/categories').then((res) => setCategories(res.data.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(c: Category) {
    setEditingId(c.id);
    setName(c.name);
    setDescription(c.description || '');
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setDescription('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name, description });
        toast.success('Category updated.');
      } else {
        await api.post('/categories', { name, description });
        toast.success('Category created.');
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? This cannot be undone.')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Manage Categories</h1>

      <form onSubmit={handleSubmit} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label-text">Name</label>
          <input required className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Landscaping" />
        </div>
        <div className="flex-1">
          <label className="label-text">Description (optional)</label>
          <input className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} {editingId ? 'Update' : 'Add'}
        </button>
        {editingId && <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>}
      </form>

      <div className="card divide-y divide-slate-100">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-slate-800">{c.name}</p>
              {c.description && <p className="text-sm text-slate-500">{c.description}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => startEdit(c)} className="text-slate-400 hover:text-primary-600"><Pencil size={16} /></button>
              <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import api from '../api/client';

export default function NewIssueModal({ projectId, onClose, onCreated }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'BUG',
    priority: 'MEDIUM',
    assigneeId: '',
  });

  useEffect(() => {
    api.get('/auth/users').then(({ data }) => setUsers(data.users));
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/issues', {
        ...form,
        projectId,
        assigneeId: form.assigneeId || null,
        description: form.description || undefined,
      });
      onCreated(data.issue);
    } catch (err) {
      const d = err.response?.data;
      setError(d?.details ? Object.values(d.details).flat()[0] : d?.error || 'Could not create issue');
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h3 className="text-lg font-semibold">New issue</h3>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input className="input" placeholder="Title" value={form.title} onChange={set('title')} required />
        <textarea
          className="input"
          rows={3}
          placeholder="Description (markdown)"
          value={form.description}
          onChange={set('description')}
        />
        <div className="grid grid-cols-2 gap-3">
          <select className="input" value={form.type} onChange={set('type')}>
            {['BUG', 'FEATURE', 'CHORE', 'EPIC'].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select className="input" value={form.priority} onChange={set('priority')}>
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <select className="input" value={form.assigneeId} onChange={set('assigneeId')}>
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.fullName}</option>
          ))}
        </select>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
            Cancel
          </button>
          <button className="btn">Create</button>
        </div>
      </form>
    </div>
  );
}

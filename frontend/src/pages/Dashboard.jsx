import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Dashboard() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    api.get('/issues').then(({ data }) => setIssues(data.issues));
  }, []);

  const count = (fn) => issues.filter(fn).length;
  const stats = [
    { label: 'Total issues', value: issues.length },
    { label: 'Open bugs', value: count((i) => i.type === 'BUG' && i.status !== 'DONE') },
    { label: 'In review', value: count((i) => i.status === 'REVIEW') },
    { label: 'Completed', value: count((i) => i.status === 'DONE') },
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Dashboard</h2>
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <h3 className="mb-3 text-lg font-medium">Recent issues</h3>
      <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-900">
        {issues.slice(0, 6).map((i) => (
          <li key={i.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>
              <span className="mr-3 font-mono text-indigo-400">{i.issueKey}</span>
              {i.title}
            </span>
            <span className="text-xs text-slate-400">{i.status.replace('_', ' ')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

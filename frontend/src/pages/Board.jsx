import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import IssueCard from '../components/IssueCard';
import NewIssueModal from '../components/NewIssueModal';

const COLUMNS = [
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'REVIEW', label: 'Review' },
  { id: 'DONE', label: 'Done' },
];

export default function Board() {
  const { user } = useAuth();
  const canEdit = user.role === 'ADMIN' || user.role === 'DEVELOPER';

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [issues, setIssues] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/projects').then(({ data }) => {
      setProjects(data.projects);
      if (data.projects.length) setProjectId(data.projects[0].id);
    });
  }, []);

  useEffect(() => {
    if (!projectId) return;
    api.get('/issues', { params: { projectId } }).then(({ data }) => setIssues(data.issues));
  }, [projectId]);

  const showError = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const moveIssue = async (id, status) => {
    const issue = issues.find((i) => i.id === id);
    if (!issue || issue.status === status) return;
    try {
      const { data } = await api.patch(`/issues/${id}/status`, { status });
      setIssues((prev) => prev.map((i) => (i.id === id ? data.issue : i)));
    } catch (err) {
      showError(err.response?.data?.error || 'Could not move issue');
    }
  };

  const onDrop = (e, status) => {
    e.preventDefault();
    moveIssue(e.dataTransfer.getData('text/plain'), status);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">Board</h2>
          <select className="input w-64" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.key} — {p.name}</option>
            ))}
          </select>
        </div>
        {canEdit && projectId && (
          <button className="btn" onClick={() => setShowModal(true)}>+ New issue</button>
        )}
      </div>

      {toast && (
        <div className="mb-4 rounded-md border border-red-800 bg-red-950 px-4 py-2 text-sm text-red-300">
          {toast}
        </div>
      )}

      <div className="grid min-w-[900px] grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = issues.filter((i) => i.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, col.id)}
              className="min-h-[60vh] rounded-lg border border-slate-800 bg-slate-900 p-3"
            >
              <h3 className="mb-3 flex justify-between text-sm font-semibold text-slate-300">
                {col.label}
                <span className="text-slate-500">{items.length}</span>
              </h3>
              <div className="flex flex-col gap-3">
                {items.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} draggable={canEdit} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <NewIssueModal
          projectId={projectId}
          onClose={() => setShowModal(false)}
          onCreated={(issue) => {
            setIssues((prev) => [issue, ...prev]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

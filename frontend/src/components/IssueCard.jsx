const PRIORITY = {
  LOW: 'bg-slate-700 text-slate-200',
  MEDIUM: 'bg-blue-900 text-blue-200',
  HIGH: 'bg-orange-900 text-orange-200',
  CRITICAL: 'bg-red-900 text-red-200',
};

export default function IssueCard({ issue, draggable }) {
  return (
    <div
      draggable={draggable}
      onDragStart={(e) => e.dataTransfer.setData('text/plain', issue.id)}
      className="cursor-grab rounded-md border border-slate-700 bg-slate-800 p-3 text-sm shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs text-indigo-400">{issue.issueKey}</span>
        <span className={`rounded px-2 py-0.5 text-xs ${PRIORITY[issue.priority]}`}>{issue.priority}</span>
      </div>
      <p className="mb-2 font-medium">{issue.title}</p>
      <div className="flex justify-between text-xs text-slate-400">
        <span>{issue.type}</span>
        <span>{issue.assignee?.fullName ?? 'Unassigned'}</span>
      </div>
    </div>
  );
}

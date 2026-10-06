const findings = [
  { tool: 'Semgrep (SAST)', critical: 0, high: 1, medium: 3 },
  { tool: 'npm audit (SCA)', critical: 0, high: 0, medium: 2 },
  { tool: 'Trivy (container)', critical: 0, high: 2, medium: 5 },
];

const runs = [
  { id: '#18', branch: 'main', stage: 'Trivy image scan', status: 'Passed', time: '3m 02s' },
  { id: '#17', branch: 'develop', stage: 'Semgrep SAST', status: 'Failed', time: '1m 21s' },
  { id: '#16', branch: 'develop', stage: 'Dependency audit', status: 'Passed', time: '1m 48s' },
];

const badge = (status) =>
  status === 'Passed' ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300';

export default function Security() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-2xl font-semibold">Security</h2>
        <span className="rounded bg-amber-900 px-2 py-0.5 text-xs text-amber-300">Preview data</span>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {findings.map((f) => (
          <div key={f.tool} className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <p className="mb-3 text-sm text-slate-400">{f.tool}</p>
            <div className="flex gap-4 text-sm">
              <span className="text-red-400">{f.critical} critical</span>
              <span className="text-orange-400">{f.high} high</span>
              <span className="text-yellow-400">{f.medium} medium</span>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-3 text-lg font-medium">Recent pipeline runs</h3>
      <table className="w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900 text-sm">
        <thead className="text-left text-slate-400">
          <tr>
            <th className="p-3">Run</th>
            <th className="p-3">Branch</th>
            <th className="p-3">Stage</th>
            <th className="p-3">Status</th>
            <th className="p-3">Duration</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id} className="border-t border-slate-800">
              <td className="p-3 font-mono">{r.id}</td>
              <td className="p-3">{r.branch}</td>
              <td className="p-3">{r.stage}</td>
              <td className="p-3">
                <span className={`rounded px-2 py-0.5 text-xs ${badge(r.status)}`}>{r.status}</span>
              </td>
              <td className="p-3 text-slate-400">{r.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

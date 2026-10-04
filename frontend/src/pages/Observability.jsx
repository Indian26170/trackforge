const cards = [
  { label: 'p95 latency', value: '142 ms' },
  { label: 'Requests / min', value: '318' },
  { label: 'Error rate', value: '0.4%' },
  { label: 'Uptime', value: '99.7%' },
];

const latency = [120, 95, 140, 110, 180, 130, 90, 105, 160, 125, 100, 115];

export default function Observability() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-2xl font-semibold">Observability</h2>
        <span className="rounded bg-amber-900 px-2 py-0.5 text-xs text-amber-300">Preview data</span>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">{c.label}</p>
            <p className="mt-2 text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
        <h3 className="mb-4 text-sm font-medium text-slate-300">API latency (ms), last 12 intervals</h3>
        <div className="flex h-48 items-end gap-2">
          {latency.map((v, i) => (
            <div
              key={i}
              title={`${v} ms`}
              className="flex-1 rounded-t bg-indigo-500"
              style={{ height: `${(v / 200) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/board', label: 'Board' },
  { to: '/security', label: 'Security' },
  { to: '/observability', label: 'Observability' },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r border-slate-800 bg-slate-900 p-4">
        <h1 className="mb-8 text-xl font-bold text-indigo-400">TrackForge</h1>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-800 pt-4 text-sm">
          <p className="font-medium">{user.fullName}</p>
          <p className="mb-3 text-xs text-slate-400">{user.role}</p>
          <button onClick={logout} className="w-full rounded-md bg-slate-800 px-3 py-2 hover:bg-slate-700">
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}

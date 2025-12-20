import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/debates', label: 'Debates', icon: '💬' },
    { path: '/topics', label: 'Topics', icon: '📚' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
  ];

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MODERATOR';

  return (
    <aside className="w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 min-h-screen">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-white/20 text-white'
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-white/20">
            <div className="text-blue-300 text-xs font-semibold px-4 mb-2">
              ADMIN
            </div>
            <Link
              to="/admin/users"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-white/10 transition-colors"
            >
              <span className="text-xl">👥</span>
              <span className="font-medium">Users</span>
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}

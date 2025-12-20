import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="text-white text-xl font-bold hover:text-blue-200">
            Virtual Debating Club
          </Link>

          {user && (
            <div className="flex items-center gap-6">
              <span className="text-white text-sm">
                {user.username} <span className="text-blue-300">({user.role})</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-white hover:text-blue-200 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

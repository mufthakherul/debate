import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Welcome, {user?.username}!
        </h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-2">Your Role</h3>
            <p className="text-3xl font-bold text-blue-300">{user?.role}</p>
          </div>

          <Link
            to="/debates"
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white hover:bg-white/20 transition-colors"
          >
            <h3 className="text-xl font-semibold mb-2">Debates</h3>
            <p className="text-blue-200">View and manage debates</p>
          </Link>

          <Link
            to="/notifications"
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white hover:bg-white/20 transition-colors"
          >
            <h3 className="text-xl font-semibold mb-2">Notifications</h3>
            <p className="text-blue-200">Check your notifications</p>
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
              <>
                <Link
                  to="/debates?create=true"
                  className="block px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  ➕ Create New Debate
                </Link>
                <Link
                  to="/topics"
                  className="block px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  📚 Manage Topics
                </Link>
              </>
            )}
            <Link
              to="/debates"
              className="block px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              💬 Browse Debates
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

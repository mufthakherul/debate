import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { apiClient } from '../lib/api-client';
import { Debate } from '../lib/types';

export default function DebatesList() {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDebates();
  }, []);

  const loadDebates = async () => {
    try {
      const data = await apiClient.getDebates();
      setDebates(data.debates);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load debates');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      DRAFT: 'bg-gray-500',
      SCHEDULED: 'bg-yellow-500',
      OPEN: 'bg-green-500',
      IN_PROGRESS: 'bg-blue-500',
      COMPLETED: 'bg-purple-500',
      CANCELLED: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-white text-center">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Debates</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-white">
            {error}
          </div>
        )}

        {debates.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white text-center">
            <p className="text-xl mb-4">No debates found</p>
            <p className="text-blue-200">Check back later for new debates!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {debates.map((debate) => (
              <Link
                key={debate.id}
                to={`/debates/${debate.id}`}
                className="block bg-white/10 backdrop-blur-lg rounded-lg p-6 hover:bg-white/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {debate.title}
                      </h3>
                      <span
                        className={`${getStatusColor(
                          debate.status
                        )} text-white text-xs px-2 py-1 rounded`}
                      >
                        {debate.status}
                      </span>
                      {debate.isPublic && (
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                          PUBLIC
                        </span>
                      )}
                    </div>

                    {debate.description && (
                      <p className="text-blue-200 mb-2">{debate.description}</p>
                    )}

                    {debate.topic && (
                      <div className="text-sm text-blue-300">
                        📚 Topic: {debate.topic.title}
                        {debate.topic.category && ` • ${debate.topic.category}`}
                        {debate.topic.difficulty && ` • ${debate.topic.difficulty}`}
                      </div>
                    )}

                    {debate.scheduledAt && (
                      <div className="text-sm text-blue-300 mt-2">
                        🕐 Scheduled: {new Date(debate.scheduledAt).toLocaleString()}
                      </div>
                    )}

                    {debate.participants && debate.participants.length > 0 && (
                      <div className="text-sm text-blue-300 mt-2">
                        👥 {debate.participants.length} participant(s)
                      </div>
                    )}
                  </div>

                  <div className="text-right text-sm text-blue-300">
                    <div>Created by: {debate.creator?.username || 'Unknown'}</div>
                    <div>{new Date(debate.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

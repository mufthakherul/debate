import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { apiClient } from '../lib/api-client';
import { Topic } from '../lib/types';

export default function Topics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const data = await apiClient.getTopics();
      setTopics(data.topics);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      BEGINNER: 'bg-green-600',
      INTERMEDIATE: 'bg-yellow-600',
      ADVANCED: 'bg-orange-600',
      EXPERT: 'bg-red-600',
    };
    return colors[difficulty] || 'bg-gray-600';
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
        <h1 className="text-4xl font-bold text-white mb-8">Topics</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-white">
            {error}
          </div>
        )}

        {topics.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white text-center">
            <p className="text-xl">No topics available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white/10 backdrop-blur-lg rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-white flex-1">
                    {topic.title}
                  </h3>
                  <span
                    className={`${getDifficultyColor(
                      topic.difficulty
                    )} text-white text-xs px-2 py-1 rounded`}
                  >
                    {topic.difficulty}
                  </span>
                </div>

                {topic.description && (
                  <p className="text-blue-200 mb-3">{topic.description}</p>
                )}

                <div className="flex items-center gap-2">
                  {topic.category && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {topic.category}
                    </span>
                  )}
                  <span className="text-blue-300 text-xs">
                    Created {new Date(topic.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { apiClient } from '../lib/api-client';
import { Debate } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';

export default function DebateDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [debate, setDebate] = useState<Debate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [scoreForm, setScoreForm] = useState({
    participantId: '',
    category: '',
    score: '',
    maxScore: '100',
    feedback: '',
  });

  useEffect(() => {
    if (id) {
      loadDebate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadDebate = async () => {
    try {
      const data = await apiClient.getDebate(id!);
      setDebate(data.debate);
      
      // Check if user is a judge
      const isJudge = data.debate.participants?.some(
        (p: any) => p.userId === user?.id && p.role === 'JUDGE'
      );
      setShowScoreForm(isJudge || user?.role === 'ADMIN');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load debate');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.submitScore({
        debateId: id!,
        participantId: scoreForm.participantId,
        category: scoreForm.category,
        score: parseFloat(scoreForm.score),
        maxScore: parseFloat(scoreForm.maxScore),
        feedback: scoreForm.feedback,
        isPublic: false,
      });
      alert('Score submitted successfully!');
      setScoreForm({
        participantId: '',
        category: '',
        score: '',
        maxScore: '100',
        feedback: '',
      });
      loadDebate();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit score');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-white text-center">Loading...</div>
      </Layout>
    );
  }

  if (error || !debate) {
    return (
      <Layout>
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-white">
          {error || 'Debate not found'}
        </div>
      </Layout>
    );
  }

  const debaters = debate.participants?.filter((p) => p.role === 'DEBATER') || [];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-white mb-4">{debate.title}</h1>
          
          <div className="flex gap-2 mb-4">
            <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded">
              {debate.status}
            </span>
            {debate.isPublic && (
              <span className="bg-green-600 text-white text-sm px-3 py-1 rounded">
                PUBLIC
              </span>
            )}
          </div>

          {debate.description && (
            <p className="text-blue-100 mb-4">{debate.description}</p>
          )}

          {debate.topic && (
            <div className="bg-white/10 rounded p-4 mb-4">
              <h3 className="text-white font-semibold mb-1">Topic</h3>
              <p className="text-blue-100">{debate.topic.title}</p>
              {debate.topic.description && (
                <p className="text-blue-200 text-sm mt-1">{debate.topic.description}</p>
              )}
              <div className="flex gap-2 mt-2">
                {debate.topic.category && (
                  <span className="text-xs text-blue-300">
                    Category: {debate.topic.category}
                  </span>
                )}
                {debate.topic.difficulty && (
                  <span className="text-xs text-blue-300">
                    Difficulty: {debate.topic.difficulty}
                  </span>
                )}
              </div>
            </div>
          )}

          {debate.scheduledAt && (
            <div className="text-blue-200 mb-2">
              🕐 Scheduled: {new Date(debate.scheduledAt).toLocaleString()}
            </div>
          )}
        </div>

        {debate.participants && debate.participants.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Participants</h2>
            <div className="space-y-2">
              {debate.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between bg-white/10 rounded p-3"
                >
                  <div className="text-white">
                    <span className="font-semibold">
                      {participant.user?.username || 'Unknown'}
                    </span>
                    <span className="text-blue-300 ml-2">({participant.role})</span>
                  </div>
                  {participant.teamSide !== 'NEUTRAL' && (
                    <span className="text-blue-200 text-sm">{participant.teamSide}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {debate.rounds && debate.rounds.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Rounds</h2>
            <div className="space-y-2">
              {debate.rounds.map((round) => (
                <div
                  key={round.id}
                  className="flex items-center justify-between bg-white/10 rounded p-3"
                >
                  <div className="text-white">
                    <span className="font-semibold">Round {round.order}</span>
                    <span className="text-blue-300 ml-2">({round.type})</span>
                  </div>
                  <span className="text-blue-200 text-sm">
                    {round.durationSeconds}s
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showScoreForm && debaters.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Submit Score</h2>
            <form onSubmit={handleScoreSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Participant</label>
                <select
                  value={scoreForm.participantId}
                  onChange={(e) =>
                    setScoreForm({ ...scoreForm, participantId: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
                  required
                >
                  <option value="">Select a participant...</option>
                  {debaters.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.username} ({p.teamSide})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">Category</label>
                <input
                  type="text"
                  value={scoreForm.category}
                  onChange={(e) =>
                    setScoreForm({ ...scoreForm, category: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:border-white"
                  placeholder="e.g., Argumentation, Delivery, Rebuttal"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Score</label>
                  <input
                    type="number"
                    step="0.1"
                    value={scoreForm.score}
                    onChange={(e) =>
                      setScoreForm({ ...scoreForm, score: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:border-white"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Max Score</label>
                  <input
                    type="number"
                    step="0.1"
                    value={scoreForm.maxScore}
                    onChange={(e) =>
                      setScoreForm({ ...scoreForm, maxScore: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:border-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Feedback (Optional)</label>
                <textarea
                  value={scoreForm.feedback}
                  onChange={(e) =>
                    setScoreForm({ ...scoreForm, feedback: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:border-white"
                  placeholder="Your feedback..."
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-blue-900 font-semibold py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Submit Score
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}

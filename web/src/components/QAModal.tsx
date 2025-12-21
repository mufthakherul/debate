import { useState, useEffect } from 'react'

interface Question {
  id: string
  author: string
  text: string
  upvotes: number
  timestamp: string
  answered: boolean
}

interface QAModalProps {
  isOpen: boolean
  onClose: () => void
  debateId: string
}

export const QAModal: React.FC<QAModalProps> = ({ isOpen, onClose, debateId: _debateId }) => {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      author: 'User123',
      text: 'Can you provide more examples of how technology enhances communication?',
      upvotes: 15,
      timestamp: '2 min ago',
      answered: false,
    },
    {
      id: '2',
      author: 'Debater456',
      text: 'What about the environmental impact of increased technology usage?',
      upvotes: 8,
      timestamp: '5 min ago',
      answered: false,
    },
    {
      id: '3',
      author: 'Observer789',
      text: 'How do you address concerns about privacy in digital communications?',
      upvotes: 12,
      timestamp: '7 min ago',
      answered: true,
    },
  ])
  const [newQuestion, setNewQuestion] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('popular')

  useEffect(() => {
    if (!isOpen) return

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim()) return

    const question: Question = {
      id: Date.now().toString(),
      author: 'You',
      text: newQuestion,
      upvotes: 0,
      timestamp: 'Just now',
      answered: false,
    }

    setQuestions([question, ...questions])
    setNewQuestion('')
  }

  const handleUpvote = (id: string) => {
    setQuestions(
      questions.map(q => (q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q))
    )
  }

  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.upvotes - a.upvotes
    }
    return 0 // Keep original order for recent
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            ❓ Audience Q&A
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6 text-slate-500 dark:text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Submit Question Form */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSubmitQuestion} className="space-y-3">
            <textarea
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              placeholder="Ask your question here..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <button
              type="submit"
              disabled={!newQuestion.trim()}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Submit Question
            </button>
          </form>
        </div>

        {/* Sort Options */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('popular')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'popular'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              🔥 Most Popular
            </button>
            <button
              onClick={() => setSortBy('recent')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'recent'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              🕐 Most Recent
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {sortedQuestions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No questions yet. Be the first to ask!
            </div>
          ) : (
            sortedQuestions.map(question => (
              <div
                key={question.id}
                className={`bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border transition-all ${
                  question.answered
                    ? 'border-green-300 dark:border-green-700'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleUpvote(question.id)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Upvote question"
                    >
                      <svg
                        className="w-5 h-5 text-slate-600 dark:text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {question.upvotes}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {question.author}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                          {question.timestamp}
                        </span>
                      </div>
                      {question.answered && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                          ✓ Answered
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{question.text}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

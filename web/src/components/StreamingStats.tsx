import { useEffect, useState } from 'react'

interface StreamingStatsProps {
  debateId: string
  refreshInterval?: number // in milliseconds
}

interface Stats {
  viewerCount: number
  peakViewers: number
  totalComments: number
  totalLikes: number
  recordedAt?: string
}

export const StreamingStats: React.FC<StreamingStatsProps> = ({
  debateId,
  refreshInterval = 5000,
}) => {
  const [stats, setStats] = useState<Stats>({
    viewerCount: 0,
    peakViewers: 0,
    totalComments: 0,
    totalLikes: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // This would be replaced with actual API call
        // const response = await fetch(`/api/streaming/stats/${debateId}`)
        // const data = await response.json()
        // setStats(data)
        
        // Mock data for now
        setStats({
          viewerCount: Math.floor(Math.random() * 200) + 50,
          peakViewers: 250,
          totalComments: Math.floor(Math.random() * 100) + 20,
          totalLikes: Math.floor(Math.random() * 50) + 10,
        })
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch streaming stats:', error)
        setIsLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, refreshInterval)

    return () => clearInterval(interval)
  }, [debateId, refreshInterval])

  if (isLoading) {
    return (
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded"></div>
          <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4 border border-blue-200 dark:border-slate-700 shadow-lg">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
        📊 Live Engagement
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Current Viewers */}
        <div className="bg-white dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 animate-scale-up">
            {stats.viewerCount.toLocaleString()}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            👥 Current Viewers
          </div>
        </div>

        {/* Peak Viewers */}
        <div className="bg-white dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.peakViewers.toLocaleString()}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            📈 Peak Viewers
          </div>
        </div>

        {/* Total Comments */}
        <div className="bg-white dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.totalComments.toLocaleString()}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            💬 Comments
          </div>
        </div>

        {/* Total Likes */}
        <div className="bg-white dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
            {stats.totalLikes.toLocaleString()}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            ❤️ Likes
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Updated every {refreshInterval / 1000}s</span>
          {stats.recordedAt && (
            <span>{new Date(stats.recordedAt).toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </div>
  )
}

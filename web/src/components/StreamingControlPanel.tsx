import { useState } from 'react'

export interface StreamPlatform {
  platform: 'YOUTUBE' | 'FACEBOOK' | 'TWITCH' | 'CUSTOM_RTMP'
  streamKey?: string
  streamUrl?: string
  isActive: boolean
  status: string
}

export interface StreamingControlPanelProps {
  debateId: string
  onStartStream: (platforms: StreamPlatform[]) => Promise<void>
  onStopStream: (platforms?: string[]) => Promise<void>
  platforms: StreamPlatform[]
  isStreaming: boolean
}

export const StreamingControlPanel: React.FC<StreamingControlPanelProps> = ({
  debateId,
  onStartStream,
  onStopStream,
  platforms,
  isStreaming,
}) => {
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [showConfig, setShowConfig] = useState(false)
  const [streamKeys, setStreamKeys] = useState<Record<string, string>>({})
  const [rtmpUrl, setRtmpUrl] = useState('')

  const platformLabels = {
    YOUTUBE: 'YouTube',
    FACEBOOK: 'Facebook',
    TWITCH: 'Twitch',
    CUSTOM_RTMP: 'Custom RTMP',
  }

  const handleStartStream = async () => {
    if (selectedPlatforms.length === 0) {
      // TODO: Replace with toast notification system
      console.warn('Please select at least one platform')
      return
    }

    setIsStarting(true)
    try {
      const platformConfigs: StreamPlatform[] = selectedPlatforms.map(p => ({
        platform: p as StreamPlatform['platform'],
        streamKey: streamKeys[p] || undefined,
        streamUrl: p === 'CUSTOM_RTMP' ? rtmpUrl : undefined,
        isActive: true,
        status: 'STARTING',
      }))

      await onStartStream(platformConfigs)
      setShowConfig(false)
    } catch (error) {
      console.error('Failed to start stream:', error)
      // TODO: Replace with toast notification system
    } finally {
      setIsStarting(false)
    }
  }

  const handleStopStream = async () => {
    setIsStopping(true)
    try {
      await onStopStream()
    } catch (error) {
      console.error('Failed to stop stream:', error)
      // TODO: Replace with toast notification system
    } finally {
      setIsStopping(false)
    }
  }

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Controls */}
      <div className="flex gap-3">
        {!isStreaming ? (
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isStarting}
          >
            {isStarting ? (
              <>
                <span className="inline-block animate-spin mr-2">⚙️</span>
                Starting...
              </>
            ) : (
              <>▶️ Start Stream</>
            )}
          </button>
        ) : (
          <button
            onClick={handleStopStream}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isStopping}
          >
            {isStopping ? (
              <>
                <span className="inline-block animate-spin mr-2">⚙️</span>
                Stopping...
              </>
            ) : (
              <>⏹️ Stop Stream</>
            )}
          </button>
        )}
      </div>

      {/* Configuration Panel */}
      {showConfig && !isStreaming && (
        <div
          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-4 space-y-4 animate-slide-in"
          data-debate-id={debateId}
        >
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Select Streaming Platforms
          </h4>

          <div className="space-y-2">
            {Object.entries(platformLabels).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(key)}
                    onChange={() => togglePlatform(key)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-700 dark:text-slate-300">{label}</span>
                </label>

                {selectedPlatforms.includes(key) && (
                  <div className="ml-6 space-y-2 animate-fade-in">
                    {key === 'CUSTOM_RTMP' ? (
                      <>
                        <input
                          type="text"
                          placeholder="RTMP URL (rtmp://...)"
                          value={rtmpUrl}
                          onChange={e => setRtmpUrl(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="password"
                          placeholder="Stream Key"
                          value={streamKeys[key] || ''}
                          onChange={e =>
                            setStreamKeys({ ...streamKeys, [key]: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </>
                    ) : (
                      <input
                        type="password"
                        placeholder="Stream Key"
                        value={streamKeys[key] || ''}
                        onChange={e =>
                          setStreamKeys({ ...streamKeys, [key]: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleStartStream}
              disabled={selectedPlatforms.length === 0 || isStarting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isStarting ? 'Starting...' : 'Confirm & Start'}
            </button>
            <button
              onClick={() => setShowConfig(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Platform Status Indicators */}
      {platforms.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Platform Status
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {platforms.map(platform => (
              <div
                key={platform.platform}
                className={`px-3 py-2 rounded-lg border transition-all ${
                  platform.isActive && platform.status === 'LIVE'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600'
                    : platform.status === 'ERROR'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {platformLabels[platform.platform]}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      platform.isActive && platform.status === 'LIVE'
                        ? 'bg-green-600 dark:bg-green-500 text-white'
                        : platform.status === 'ERROR'
                        ? 'bg-red-600 dark:bg-red-500 text-white'
                        : 'bg-slate-400 dark:bg-slate-600 text-white'
                    }`}
                  >
                    {platform.isActive && platform.status === 'LIVE' && (
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    )}
                    {platform.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

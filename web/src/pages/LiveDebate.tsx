import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmModal } from '../components/ConfirmModal'

// Tooltip component for accessibility
const Tooltip = ({ children, text }: { children: React.ReactNode; text: string }) => (
  <div className="group relative inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

// Mock data for the live debate
const mockDebateData = {
  title: 'Team A vs Team B',
  topic: 'Technology enhances human connection more than it diminishes it',
  status: 'LIVE',
  currentRound: 'Opening Statements',
  currentSpeaker: 'Alice Johnson',
  currentTeam: 'A',
  timeRemaining: 300, // seconds
  format: 'Lincoln-Douglas',
  schedule: [
    { time: '14:00', event: 'Opening Statements - Team A' },
    { time: '14:05', event: 'Opening Statements - Team B' },
    { time: '14:10', event: 'Cross-Examination' },
    { time: '14:20', event: 'Rebuttals' },
    { time: '14:30', event: 'Closing Statements' },
  ],
  speakingOrder: [
    { name: 'Alice Johnson', team: 'A', role: 'Main Speaker' },
    { name: 'Bob Smith', team: 'B', role: 'Main Speaker' },
    { name: 'Carol Davis', team: 'A', role: 'Supporting' },
    { name: 'David Lee', team: 'B', role: 'Supporting' },
  ],
  roles: {
    host: 'John Host',
    moderator: 'Jane Moderator',
    timekeeper: 'Tim Keeper',
    judges: ['Judge Smith', 'Judge Wilson', 'Judge Brown'],
  },
  teamA: [
    { id: 1, name: 'Alice Johnson', speaking: true },
    { id: 2, name: 'Carol Davis', speaking: false },
    { id: 3, name: 'Eve Wilson', speaking: false },
  ],
  teamB: [
    { id: 4, name: 'Bob Smith', speaking: false },
    { id: 5, name: 'David Lee', speaking: false },
    { id: 6, name: 'Frank Miller', speaking: false },
  ],
  audienceCount: 127,
  streaming: {
    youtube: 'Connected',
    facebook: 'Disconnected',
    twitch: 'Connected',
    rtmp: 'Disconnected',
  },
  recording: true,
  audienceRequests: [
    { id: 1, name: 'User1', type: 'hand-raise', timestamp: '14:03' },
    { id: 2, name: 'User2', type: 'speak', timestamp: '14:05' },
  ],
}

export default function LiveDebate() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'chat' | 'qa'>('chat')
  const [announcementTab, setAnnouncementTab] = useState<'announcements' | 'qa'>('announcements')
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [audienceCollapsed, setAudienceCollapsed] = useState(false)

  const handleLeave = () => {
    navigate('/debates')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      {/* Header - More compact and accessible */}
      <header className="bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between min-h-[64px] gap-3 py-2 flex-wrap">
            <div className="flex items-center gap-3 flex-shrink-0">
              <h1 className="text-white text-base sm:text-lg font-bold">Virtual Debating Club</h1>
              <div className="hidden md:block h-6 w-px bg-white/30" />
              <h2 className="text-white text-sm sm:text-base font-semibold">{mockDebateData.title}</h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-md" title="Live broadcast">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                {mockDebateData.status}
              </span>
              <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs rounded-full shadow-sm" title="Current round">
                {mockDebateData.currentRound}
              </span>
              <span className="hidden sm:inline-flex px-2 py-1 bg-purple-700 text-white text-xs rounded" title="Host">
                Host: {mockDebateData.roles.host}
              </span>
              <span className="hidden sm:inline-flex px-2 py-1 bg-green-700 text-white text-xs rounded" title="Moderator">
                Mod: {mockDebateData.roles.moderator}
              </span>
              <span className="hidden md:inline-flex px-2 py-1 bg-orange-700 text-white text-xs rounded" title="Timekeeper">
                Time: {mockDebateData.roles.timekeeper}
              </span>
              <Tooltip text="Leave debate session">
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  aria-label="Leave debate"
                >
                  Leave
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          
          {/* Left Rail - Collapsible Audience Section */}
          <aside className="lg:col-span-3 xl:col-span-2 space-y-4">
            <div className="bg-slate-800/60 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 shadow-xl">
              <button
                onClick={() => setAudienceCollapsed(!audienceCollapsed)}
                className="w-full flex items-center justify-between mb-3 text-white font-semibold text-sm hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                aria-expanded={!audienceCollapsed}
              >
                <span className="flex items-center gap-2">
                  👥 Audience & Requests
                </span>
                <span className={`transform transition-transform ${audienceCollapsed ? '' : 'rotate-180'}`}>
                  ▼
                </span>
              </button>
              
              {!audienceCollapsed && (
                <>
                  <div className="mb-4">
                    <div className="text-white text-3xl font-bold text-center">{mockDebateData.audienceCount}</div>
                    <div className="text-blue-300 text-xs text-center">viewers online</div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <Tooltip text="Raise your hand to get attention">
                      <button className="w-full px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        🙋 Raise Hand
                      </button>
                    </Tooltip>
                    <Tooltip text="Request permission to speak">
                      <button className="w-full px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        🎤 Request to Speak
                      </button>
                    </Tooltip>
                  </div>

                  <div className="border-t border-slate-700/50 pt-3">
                    <h4 className="text-white font-semibold mb-2 text-xs text-slate-300">View Requests</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {mockDebateData.audienceRequests.map((req) => (
                        <div key={req.id} className="text-xs text-white bg-slate-700/50 rounded-lg p-2.5 hover:bg-slate-700 transition-colors">
                          <div className="font-medium">{req.name}</div>
                          <div className="text-blue-300 text-xs">{req.type} • {req.timestamp}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* Main Stage - Centered Content */}
          <main className="lg:col-span-6 xl:col-span-7 space-y-4" role="main">
            
            {/* Centered Current Speaker Highlight */}
            <section className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-5 border border-emerald-500/30 shadow-2xl" aria-label="Current speaker">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-emerald-100 font-semibold mb-1 text-xs uppercase tracking-wide">Currently Speaking</h3>
                  <div className="text-white text-2xl sm:text-3xl font-bold mb-1">{mockDebateData.currentSpeaker}</div>
                  <div className="text-emerald-100 text-sm">Team {mockDebateData.currentTeam} • {mockDebateData.currentRound}</div>
                </div>
                <div className="flex-shrink-0">
                  <div className="text-white text-4xl sm:text-5xl font-mono font-bold text-center px-6 py-3 bg-emerald-900/40 rounded-xl backdrop-blur-sm border border-emerald-400/30">
                    {formatTime(mockDebateData.timeRemaining)}
                  </div>
                </div>
              </div>
            </section>

            {/* Timekeeper Controls - Right below Current Speaker */}
            <section className="bg-slate-800/60 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 shadow-xl" aria-label="Timekeeper controls">
              <h3 className="text-white font-semibold mb-3 text-sm">⏱️ Timekeeper Controls</h3>
              <div className="flex flex-wrap gap-2">
                <Tooltip text="Start the timer">
                  <button className="flex-1 min-w-[80px] px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm">
                    ▶ Start
                  </button>
                </Tooltip>
                <Tooltip text="Pause the timer">
                  <button className="flex-1 min-w-[80px] px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 font-medium text-sm">
                    ⏸ Pause
                  </button>
                </Tooltip>
                <Tooltip text="Stop the timer">
                  <button className="flex-1 min-w-[80px] px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm">
                    ⏹ Stop
                  </button>
                </Tooltip>
                <Tooltip text="Reset the timer">
                  <button className="flex-1 min-w-[80px] px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm">
                    🔄 Reset
                  </button>
                </Tooltip>
              </div>
            </section>

            {/* Team Panels and Judges - Horizontal Layout */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Team A */}
              <section className="bg-slate-800/60 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 shadow-xl" aria-label="Team A">
                <h3 className="text-white font-bold mb-3 text-base border-b border-slate-700/50 pb-2 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  Team A (Pro)
                </h3>
                <div className="space-y-2">
                  {mockDebateData.teamA.map((member) => (
                    <div
                      key={member.id}
                      className={`p-3 rounded-lg transition-all ${
                        member.speaking
                          ? 'bg-emerald-600/30 border-2 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg'
                          : 'bg-slate-700/30 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium text-sm">{member.name}</span>
                        {member.speaking && (
                          <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full font-semibold animate-pulse">
                            Speaking
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Team B */}
              <section className="bg-slate-800/60 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 shadow-xl" aria-label="Team B">
                <h3 className="text-white font-bold mb-3 text-base border-b border-slate-700/50 pb-2 flex items-center gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  Team B (Con)
                </h3>
                <div className="space-y-2">
                  {mockDebateData.teamB.map((member) => (
                    <div
                      key={member.id}
                      className={`p-3 rounded-lg transition-all ${
                        member.speaking
                          ? 'bg-emerald-600/30 border-2 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg'
                          : 'bg-slate-700/30 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium text-sm">{member.name}</span>
                        {member.speaking && (
                          <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full font-semibold animate-pulse">
                            Speaking
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Judges Panel - Full width below teams */}
            <section className="bg-slate-800/60 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 shadow-xl" aria-label="Judges panel">
              <h3 className="text-white font-semibold mb-3 text-sm">⚖️ Judges Panel</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {mockDebateData.roles.judges.map((judge, index) => (
                  <div
                    key={index}
                    className="bg-slate-700/40 rounded-lg p-3 text-center hover:bg-slate-700/60 transition-colors border border-slate-600/30"
                  >
                    <div className="text-white font-medium text-sm">{judge}</div>
                    <div className="text-blue-300 text-xs mt-1">⚖️ Judge</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Compact Streaming Status */}
            <section className="bg-slate-800/60 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 shadow-xl" aria-label="Streaming status">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-white font-semibold text-sm mr-2">📡 Streaming:</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  mockDebateData.streaming.youtube === 'Connected'
                    ? 'bg-green-600/80 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`} title="YouTube streaming status">
                  YouTube
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  mockDebateData.streaming.facebook === 'Connected'
                    ? 'bg-green-600/80 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`} title="Facebook streaming status">
                  Facebook
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  mockDebateData.streaming.twitch === 'Connected'
                    ? 'bg-green-600/80 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`} title="Twitch streaming status">
                  Twitch
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  mockDebateData.streaming.rtmp === 'Connected'
                    ? 'bg-green-600/80 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`} title="RTMP streaming status">
                  RTMP
                </span>
                <div className="h-4 w-px bg-slate-600 mx-1"></div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                  mockDebateData.recording
                    ? 'bg-red-600/80 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`} title="Recording status">
                  {mockDebateData.recording && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}
                  {mockDebateData.recording ? 'Recording' : 'Not Recording'}
                </span>
              </div>
            </section>
          </main>

          {/* Right Rail */}
          <aside className="lg:col-span-3 space-y-4">
            {/* Announcements/Q&A */}
            <section className="bg-slate-800/60 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 shadow-xl" aria-label="Announcements and Q&A">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setAnnouncementTab('announcements')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    announcementTab === 'announcements'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="View announcements"
                >
                  📢 Announcements
                </button>
                <button
                  onClick={() => setAnnouncementTab('qa')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    announcementTab === 'qa'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="View Q&A"
                >
                  ❓ Q&A
                </button>
              </div>
              <div className="text-white text-sm space-y-2 max-h-64 overflow-y-auto">
                {announcementTab === 'announcements' ? (
                  <>
                    <div className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30">
                      <div className="font-semibold text-xs text-blue-300">Moderator</div>
                      <div className="text-slate-200 text-xs mt-1">Next round starts in 2 minutes</div>
                    </div>
                    <div className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30">
                      <div className="font-semibold text-xs text-blue-300">Host</div>
                      <div className="text-slate-200 text-xs mt-1">Please keep questions respectful</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30">
                      <div className="font-semibold text-xs text-purple-300">User123</div>
                      <div className="text-slate-200 text-xs mt-1">What about environmental impact?</div>
                    </div>
                    <div className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30">
                      <div className="font-semibold text-xs text-purple-300">Debater456</div>
                      <div className="text-slate-200 text-xs mt-1">Can you clarify that point?</div>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Debate Summary */}
            <section className="bg-slate-800/60 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 shadow-xl" aria-label="Debate summary">
              <h3 className="text-white font-semibold mb-3 text-sm">📋 Debate Summary</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-blue-300 text-xs mb-1 font-semibold">Topic</div>
                  <div className="text-white text-xs leading-relaxed">{mockDebateData.topic}</div>
                </div>
                <div>
                  <div className="text-blue-300 text-xs mb-1 font-semibold">Format</div>
                  <div className="text-white text-xs">{mockDebateData.format}</div>
                </div>
                <div>
                  <div className="text-blue-300 text-xs mb-1 font-semibold">Schedule</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {mockDebateData.schedule.map((item, index) => (
                      <div key={index} className="text-white text-xs bg-slate-700/40 rounded-lg p-2 border border-slate-600/30">
                        <span className="font-semibold text-blue-300">{item.time}</span> • {item.event}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-blue-300 text-xs mb-1 font-semibold">Speaking Order</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {mockDebateData.speakingOrder.map((speaker, index) => (
                      <div key={index} className="text-white text-xs bg-slate-700/40 rounded-lg p-2 border border-slate-600/30">
                        {index + 1}. {speaker.name} (Team {speaker.team}) • {speaker.role}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Live Chat/Q&A */}
            <section className="bg-slate-800/60 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 shadow-xl" aria-label="Live chat and Q&A">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'chat'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="View chat messages"
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setActiveTab('qa')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'qa'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="View questions"
                >
                  ❓ Questions
                </button>
              </div>
              <div className="h-32 bg-slate-900/40 rounded-lg p-3 mb-3 overflow-y-auto border border-slate-700/30">
                <div className="space-y-2 text-sm">
                  {activeTab === 'chat' ? (
                    <>
                      <div className="text-white text-xs">
                        <span className="text-blue-400 font-semibold">User1:</span> Great opening statement!
                      </div>
                      <div className="text-white text-xs">
                        <span className="text-blue-400 font-semibold">User2:</span> Looking forward to the rebuttals
                      </div>
                      <div className="text-white text-xs">
                        <span className="text-blue-400 font-semibold">User3:</span> Excellent points from both teams
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-white text-xs">
                        <span className="text-purple-400 font-semibold">Q:</span> How do you address privacy concerns?
                      </div>
                      <div className="text-white text-xs">
                        <span className="text-purple-400 font-semibold">Q:</span> What about rural communities?
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={activeTab === 'chat' ? 'Type a message...' : 'Ask a question...'}
                  className="flex-1 px-3 py-2 bg-slate-900/40 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <Tooltip text={activeTab === 'chat' ? 'Send message' : 'Submit question'}>
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium">
                    Send
                  </button>
                </Tooltip>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      <ConfirmModal
        isOpen={showLeaveModal}
        title="Leave Debate"
        message="Are you sure you want to leave this debate? You may miss important moments."
        confirmText="Leave"
        cancelText="Stay"
        onConfirm={handleLeave}
        onCancel={() => setShowLeaveModal(false)}
      />
    </div>
  )
}

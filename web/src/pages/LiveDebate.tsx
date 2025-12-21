import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmModal } from '../components/ConfirmModal'

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
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <h1 className="text-white text-lg font-bold">Virtual Debating Club</h1>
              <div className="hidden md:block h-6 w-px bg-white/30" />
              <h2 className="text-white font-semibold">{mockDebateData.title}</h2>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                {mockDebateData.status}
              </span>
              <span className="px-3 py-1 bg-indigo-500 text-white text-sm rounded-full">
                {mockDebateData.currentRound}
              </span>
              <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
                Speaker: {mockDebateData.currentSpeaker}
              </span>
              <span className="px-3 py-1 bg-slate-700 text-white text-sm font-mono rounded-full">
                {formatTime(mockDebateData.timeRemaining)}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">Host: {mockDebateData.roles.host}</span>
              <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Mod: {mockDebateData.roles.moderator}</span>
              <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded">Time: {mockDebateData.roles.timekeeper}</span>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
                aria-label="Leave debate"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Rail - Audience Actions */}
          <aside className="col-span-12 lg:col-span-2 space-y-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-3 text-sm">Audience Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors">
                  🙋 Raise Hand
                </button>
                <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                  🎤 Request to Speak
                </button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-3 text-sm">View Requests</h3>
              <div className="space-y-2">
                {mockDebateData.audienceRequests.map((req) => (
                  <div key={req.id} className="text-xs text-white bg-white/10 rounded p-2">
                    <div className="font-medium">{req.name}</div>
                    <div className="text-blue-300">{req.type} - {req.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-3 text-sm">Audience</h3>
              <div className="text-white text-2xl font-bold">{mockDebateData.audienceCount}</div>
              <div className="text-blue-300 text-xs">viewers online</div>
            </div>
          </aside>

          {/* Main Stage */}
          <main className="col-span-12 lg:col-span-7 space-y-4" role="main">
            {/* Team Panels */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Team A */}
              <section className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20" aria-label="Team A">
                <h3 className="text-white font-bold mb-3 text-lg border-b border-white/20 pb-2">
                  Team A (Pro)
                </h3>
                <div className="space-y-2">
                  {mockDebateData.teamA.map((member) => (
                    <div
                      key={member.id}
                      className={`p-3 rounded transition-all ${
                        member.speaking
                          ? 'bg-green-500/30 border-2 border-green-400 ring-2 ring-green-400'
                          : 'bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{member.name}</span>
                        {member.speaking && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                            Speaking
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Team B */}
              <section className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20" aria-label="Team B">
                <h3 className="text-white font-bold mb-3 text-lg border-b border-white/20 pb-2">
                  Team B (Con)
                </h3>
                <div className="space-y-2">
                  {mockDebateData.teamB.map((member) => (
                    <div
                      key={member.id}
                      className={`p-3 rounded transition-all ${
                        member.speaking
                          ? 'bg-green-500/30 border-2 border-green-400 ring-2 ring-green-400'
                          : 'bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{member.name}</span>
                        {member.speaking && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                            Speaking
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Judges Row */}
            <section className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20" aria-label="Judges panel">
              <h3 className="text-white font-semibold mb-3">Judges Panel</h3>
              <div className="flex flex-wrap gap-3">
                {mockDebateData.roles.judges.map((judge, index) => (
                  <div
                    key={index}
                    className="flex-1 min-w-[150px] bg-white/10 rounded-lg p-3 text-center"
                  >
                    <div className="text-white font-medium">{judge}</div>
                    <div className="text-blue-300 text-sm mt-1">⚖️ Judge</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Timekeeper Widget */}
            <section className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20" aria-label="Timekeeper controls">
              <h3 className="text-white font-semibold mb-3">Timekeeper Controls</h3>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors">
                    ▶ Start
                  </button>
                  <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors">
                    ⏸ Pause
                  </button>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors">
                    ⏹ Stop
                  </button>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                    🔄 Reset
                  </button>
                </div>
                <div className="text-white text-3xl font-mono font-bold">
                  {formatTime(mockDebateData.timeRemaining)}
                </div>
              </div>
            </section>
          </main>

          {/* Right Rail */}
          <aside className="col-span-12 lg:col-span-3 space-y-4">
            {/* Current Speaker Card */}
            <section className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg p-4 border border-white/20 shadow-lg" aria-label="Current speaker">
              <h3 className="text-white font-semibold mb-2 text-sm">Current Speaker</h3>
              <div className="text-white text-xl font-bold mb-1">{mockDebateData.currentSpeaker}</div>
              <div className="text-green-100 text-sm">Team {mockDebateData.currentTeam}</div>
              <div className="mt-3 text-white text-3xl font-mono font-bold text-center py-2 bg-white/20 rounded">
                {formatTime(mockDebateData.timeRemaining)}
              </div>
            </section>

            {/* Announcements/Q&A */}
            <section className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20" aria-label="Announcements and Q&A">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setAnnouncementTab('announcements')}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    announcementTab === 'announcements'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/10 text-blue-300 hover:bg-white/20'
                  }`}
                >
                  📢 Announcements
                </button>
                <button
                  onClick={() => setAnnouncementTab('qa')}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    announcementTab === 'qa'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/10 text-blue-300 hover:bg-white/20'
                  }`}
                >
                  ❓ Q&A
                </button>
              </div>
              <div className="text-white text-sm space-y-2">
                {announcementTab === 'announcements' ? (
                  <>
                    <div className="bg-white/10 rounded p-2">
                      <div className="font-medium">Moderator</div>
                      <div className="text-blue-300 text-xs">Next round starts in 2 minutes</div>
                    </div>
                    <div className="bg-white/10 rounded p-2">
                      <div className="font-medium">Host</div>
                      <div className="text-blue-300 text-xs">Please keep questions respectful</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white/10 rounded p-2">
                      <div className="font-medium">User123</div>
                      <div className="text-blue-300 text-xs">What about environmental impact?</div>
                    </div>
                    <div className="bg-white/10 rounded p-2">
                      <div className="font-medium">Debater456</div>
                      <div className="text-blue-300 text-xs">Can you clarify that point?</div>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Debate Summary */}
            <section className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20" aria-label="Debate summary">
              <h3 className="text-white font-semibold mb-3 text-sm">Debate Summary</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-blue-300 text-xs mb-1">Topic</div>
                  <div className="text-white">{mockDebateData.topic}</div>
                </div>
                <div>
                  <div className="text-blue-300 text-xs mb-1">Format</div>
                  <div className="text-white">{mockDebateData.format}</div>
                </div>
                <div>
                  <div className="text-blue-300 text-xs mb-1">Schedule</div>
                  <div className="space-y-1">
                    {mockDebateData.schedule.map((item, index) => (
                      <div key={index} className="text-white text-xs bg-white/10 rounded p-2">
                        <span className="font-medium">{item.time}</span> - {item.event}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-blue-300 text-xs mb-1">Speaking Order</div>
                  <div className="space-y-1">
                    {mockDebateData.speakingOrder.map((speaker, index) => (
                      <div key={index} className="text-white text-xs bg-white/10 rounded p-2">
                        {index + 1}. {speaker.name} (Team {speaker.team}) - {speaker.role}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {/* Bottom Bar - Streaming & Chat */}
        <div className="mt-4 grid lg:grid-cols-2 gap-4">
          {/* Streaming Status */}
          <section className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20" aria-label="Streaming status">
            <h3 className="text-white font-semibold mb-3">Streaming Status</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-3 py-1 rounded text-sm ${
                mockDebateData.streaming.youtube === 'Connected'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}>
                YouTube: {mockDebateData.streaming.youtube}
              </span>
              <span className={`px-3 py-1 rounded text-sm ${
                mockDebateData.streaming.facebook === 'Connected'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}>
                Facebook: {mockDebateData.streaming.facebook}
              </span>
              <span className={`px-3 py-1 rounded text-sm ${
                mockDebateData.streaming.twitch === 'Connected'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}>
                Twitch: {mockDebateData.streaming.twitch}
              </span>
              <span className={`px-3 py-1 rounded text-sm ${
                mockDebateData.streaming.rtmp === 'Connected'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}>
                RTMP: {mockDebateData.streaming.rtmp}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded text-sm ${
                mockDebateData.recording
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}>
                {mockDebateData.recording && <span className="mr-1">🔴</span>}
                Recording: {mockDebateData.recording ? 'Active' : 'Inactive'}
              </span>
            </div>
          </section>

          {/* Live Chat/Q&A */}
          <section className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20" aria-label="Live chat and Q&A">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/10 text-blue-300 hover:bg-white/20'
                }`}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setActiveTab('qa')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  activeTab === 'qa'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/10 text-blue-300 hover:bg-white/20'
                }`}
              >
                ❓ Questions
              </button>
            </div>
            <div className="h-32 bg-white/5 rounded p-2 mb-2 overflow-y-auto">
              <div className="space-y-2 text-sm">
                {activeTab === 'chat' ? (
                  <>
                    <div className="text-white">
                      <span className="text-blue-400 font-medium">User1:</span> Great opening statement!
                    </div>
                    <div className="text-white">
                      <span className="text-blue-400 font-medium">User2:</span> Looking forward to the rebuttals
                    </div>
                    <div className="text-white">
                      <span className="text-blue-400 font-medium">User3:</span> Excellent points from both teams
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-white">
                      <span className="text-purple-400 font-medium">Q:</span> How do you address privacy concerns?
                    </div>
                    <div className="text-white">
                      <span className="text-purple-400 font-medium">Q:</span> What about rural communities?
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={activeTab === 'chat' ? 'Type a message...' : 'Ask a question...'}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm transition-colors">
                Send
              </button>
            </div>
          </section>
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

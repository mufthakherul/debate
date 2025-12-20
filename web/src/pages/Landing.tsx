import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Virtual Debating Club
          </h1>
          <p className="text-xl text-blue-200">
            Engage in thoughtful discourse, sharpen your arguments, and connect with debaters worldwide
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
              <h3 className="text-2xl font-semibold mb-3">Real-time Debates</h3>
              <p className="text-blue-100">
                Participate in live debates with structured formats and real-time interaction
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
              <h3 className="text-2xl font-semibold mb-3">Skill Development</h3>
              <p className="text-blue-100">
                Improve your critical thinking, public speaking, and argumentation skills
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
              <h3 className="text-2xl font-semibold mb-3">Community</h3>
              <p className="text-blue-100">
                Join a vibrant community of debaters from diverse backgrounds
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-block bg-white text-blue-900 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>

        <footer className="mt-24 text-center text-blue-200 text-sm">
          <p>© 2025 Virtual Debating Club. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

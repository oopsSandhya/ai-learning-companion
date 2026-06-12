import { useState, useEffect } from 'react'
import type { Page } from './types'
import Navbar from './components/Navbar'
import ExplainPage from './pages/ExplainPage'
import SummaryPage from './pages/SummaryPage'
import QuizPage from './pages/QuizPage'
import NotesPage from './pages/NotesPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  const [activePage, setActivePage] = useState<Page>('explain')
  const [selectedText, setSelectedText] = useState<string>('')
  const [isYouTube, setIsYouTube] = useState(false)
  const [transcriptLoading, setTranscriptLoading] = useState(false)
  const [transcriptError, setTranscriptError] = useState<string>('')

  useEffect(() => {
    setTimeout(() => {
      try {
        chrome.runtime.sendMessage({ type: 'GET_TAB_INFO' }, async (res) => {
          if (chrome.runtime.lastError) return

          if (res?.isYouTube && res?.url) {
            setIsYouTube(true)
            setTranscriptLoading(true)
            setTranscriptError('')

            try {
              const response = await fetch('http://localhost:8000/api/transcript', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ video_url: res.url }),
              })
              const data = await response.json()
              if (response.ok && data.transcript) {
                setSelectedText(data.transcript)
              } else {
                setTranscriptError(data.error || 'Transcript load nahi hua')
              }
            } catch {
              setTranscriptError('Backend se connect nahi ho paya')
            } finally {
              setTranscriptLoading(false)
            }
          } else {
            setIsYouTube(false)
            chrome.runtime.sendMessage({ type: 'GET_SELECTED_TEXT' }, (res) => {
              if (chrome.runtime.lastError) return
              if (res?.text) setSelectedText(res.text)
            })
          }
        })
      } catch (err) {
        console.log('Error:', err)
      }
    }, 100)
  }, [])

  const renderPage = () => {
    switch (activePage) {
      case 'explain': return <ExplainPage selectedText={selectedText} isYouTube={isYouTube} />
      case 'summary': return <SummaryPage selectedText={selectedText} _isYouTube={isYouTube} />
      case 'quiz': return <QuizPage selectedText={selectedText} _isYouTube={isYouTube} />
      case 'notes': return <NotesPage selectedText={selectedText} _isYouTube={isYouTube} />
      case 'dashboard': return <DashboardPage />
    }
  }

  return (
    <div className="w-[400px] min-h-[580px] bg-[#0d0d1a] text-white flex flex-col">
      
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-10 h-10 rounded-xl bg-[#0f1a0f] border border-green-800/50 flex items-center justify-center shadow-lg shadow-green-500/20">
  <svg width="28" height="28" viewBox="0 0 60 60" fill="none">
    {/* Book left page */}
    <rect x="8" y="15" width="20" height="28" rx="3" fill="#16a34a"/>
    {/* Book right page */}
    <rect x="32" y="15" width="20" height="28" rx="3" fill="#15803d"/>
    {/* Spine */}
    <rect x="28" y="13" width="4" height="32" rx="1" fill="#166534"/>
    {/* Lines */}
    <line x1="12" y1="22" x2="24" y2="22" stroke="#bbf7d0" strokeWidth="1.5" opacity="0.6"/>
    <line x1="12" y1="28" x2="24" y2="28" stroke="#bbf7d0" strokeWidth="1.5" opacity="0.6"/>
    <line x1="36" y1="22" x2="48" y2="22" stroke="#bbf7d0" strokeWidth="1.5" opacity="0.6"/>
    <line x1="36" y1="28" x2="48" y2="28" stroke="#bbf7d0" strokeWidth="1.5" opacity="0.6"/>
    {/* Magic wand */}
    <line x1="38" y1="8" x2="52" y2="22" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="38" cy="8" r="4" fill="#fde68a"/>
    {/* Sparkles */}
    <circle cx="10" cy="10" r="2" fill="#4ade80"/>
    <circle cx="50" cy="8" r="2" fill="#fbbf24"/>
    <circle cx="8" cy="48" r="1.5" fill="#4ade80" opacity="0.8"/>
    <circle cx="52" cy="45" r="2" fill="#fbbf24" opacity="0.7"/>
  </svg>
</div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">AI Learning Companion</h1>
            <p className="text-xs text-gray-400">Understand anything, learn everything.</p>
          </div>
        </div>

        {/* AI Ready / Status badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
          transcriptLoading
            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            : transcriptError
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-green-500/20 text-green-400 border border-green-500/30'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            transcriptLoading ? 'bg-yellow-400 animate-pulse' :
            transcriptError ? 'bg-red-400' : 'bg-green-400'
          }`} />
          {transcriptLoading ? 'Loading...' : transcriptError ? 'Error' : 'AI Ready'}
        </div>
      </div>

      {/* YouTube status bar */}
      {isYouTube && !transcriptLoading && !transcriptError && (
        <div className="mx-4 mb-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff4444">
            <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.2 2.8 12 2.8 12 2.8s-4.2 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.1.7 11.3v2c0 2.1.3 4.2.3 4.2s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.5 21.7 12 21.7 12 21.7s4.2 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.1.3-4.2v-2C23.3 9.1 23 7 23 7zM9.7 15.5V8.4l8.1 3.6-8.1 3.5z"/>
          </svg>
          <span className="text-xs text-red-400">YouTube transcript loaded</span>
        </div>
      )}
      {isYouTube && transcriptError && (
        <div className="mx-4 mb-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-400">❌ {transcriptError}</p>
        </div>
      )}

      {/* Navbar */}
      <Navbar activePage={activePage} onPageChange={setActivePage} />

      {/* Page content */}
      <div className="flex-1 overflow-y-auto">
        {renderPage()}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between">
        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
          </svg>
          Settings
        </button>
        <p className="text-xs text-gray-500">Made for Learners 💜</p>
        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Feedback
        </button>
      </div>
    </div>
  )
}

export default App
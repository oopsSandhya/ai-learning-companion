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
                // Sirf pehle 300 chars dikhao display ke liye — full transcript AI ko jayega
                setSelectedText(data.transcript)
              } else {
                setTranscriptError(data.error || 'Transcript load nahi hua')
              }
            } catch (err) {
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
      case 'explain': return <ExplainPage selectedText={selectedText} />
      case 'summary': return <SummaryPage selectedText={selectedText} />
      case 'quiz': return <QuizPage selectedText={selectedText} />
      case 'notes': return <NotesPage selectedText={selectedText} />
      case 'dashboard': return <DashboardPage />
    }
  }

  return (
    <div className="w-[340px] h-[500px] bg-gray-900 text-white flex flex-col">
      <div className="px-4 py-3 border-b border-gray-700">
        <h1 className="text-sm font-bold text-blue-400">
          AI Learning Companion 🧠
        </h1>

        {isYouTube && transcriptLoading && (
          <p className="text-xs text-yellow-400 mt-1">⏳ Loading transcript...</p>
        )}
        {isYouTube && !transcriptLoading && !transcriptError && selectedText && (
          <p className="text-xs text-green-400 mt-1">✅ YouTube transcript ready!</p>
        )}
        {isYouTube && transcriptError && (
          <p className="text-xs text-red-400 mt-1">❌ {transcriptError}</p>
        )}
        {!isYouTube && selectedText && (
          <p className="text-xs text-gray-400 mt-1 truncate">
            📌 "{selectedText.substring(0, 50)}..."
          </p>
        )}
      </div>
      <Navbar activePage={activePage} onPageChange={setActivePage} />
      <div className="flex-1 overflow-y-auto">
        {renderPage()}
      </div>
    </div>
  )
}

export default App
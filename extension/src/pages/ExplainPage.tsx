import { useState, useEffect, useCallback } from 'react'
import { speakText, stopSpeech } from '../utils/speech'

interface ExplainPageProps {
  selectedText: string
  isYouTube: boolean
}

function ExplainPage({ selectedText, isYouTube }: ExplainPageProps) {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [playing, setPlaying] = useState(false)

  const handleExplain = useCallback(async () => {
    if (!selectedText) return
    setLoading(true)
    setError('')
    setResult('')
    setPlaying(false)
    try {
      const response = await fetch('http://localhost:8000/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText })
      })
      const data = await response.json()
      setResult(data.result)
    } catch {
      setError('Backend se connect nahi ho paya!')
    } finally {
      setLoading(false)
    }
  }, [selectedText])

  // Auto explain jab text load ho
  useEffect(() => {
    if (selectedText) {
      handleExplain()
    }
  }, [selectedText, handleExplain])

  const handleSpeak = () => {
    if (playing) {
      stopSpeech()
      setPlaying(false)
    } else {
      speakText(result)
      setPlaying(true)
    }
  }

  const handleCopy = () => {
    if (result) navigator.clipboard.writeText(result)
  }

  return (
    <div className="p-4 flex flex-col gap-3">

      {/* Source indicator */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium ${
          !isYouTube
            ? 'border-purple-500/50 bg-purple-500/10 text-purple-300'
            : 'border-white/10 bg-white/5 text-gray-500'
        }`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          Webpage / Text
        </div>
        <div className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium ${
          isYouTube
            ? 'border-red-500/50 bg-red-500/10 text-red-300'
            : 'border-white/10 bg-white/5 text-gray-500'
        }`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isYouTube ? "#ff4444" : "#666"}>
            <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.2 2.8 12 2.8 12 2.8s-4.2 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.1.7 11.3v2c0 2.1.3 4.2.3 4.2s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.5 21.7 12 21.7 12 21.7s4.2 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.1.3-4.2v-2C23.3 9.1 23 7 23 7zM9.7 15.5V8.4l8.1 3.6-8.1 3.5z"/>
          </svg>
          YouTube
        </div>
      </div>

      {/* Explanation Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[320px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#a78bfa">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <p className="text-sm font-semibold text-white">Explanation</p>
          </div>
          {result && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSpeak}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-400 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
                {playing ? 'Stop' : 'Listen'}
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-400 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex items-center gap-2 mt-3">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <p className="text-sm text-purple-400">AI is analyzing...</p>
            </div>
          </div>
        ) : !result ? (
           <div className="flex flex-col items-center justify-center py-10 gap-2">
             <p className="text-sm font-semibold text-white">Your explanation will appear here</p>
             <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Select text on any webpage<br/>or open a YouTube video to get started
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{result}</p>
        )}
      </div>
    </div>
  )
}

export default ExplainPage
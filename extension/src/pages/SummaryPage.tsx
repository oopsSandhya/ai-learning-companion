import { useState } from 'react'
import { speakText, stopSpeech } from '../utils/speech'

interface SummaryPageProps {
  selectedText: string
}

function SummaryPage({ selectedText }: SummaryPageProps) {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [playing, setPlaying] = useState(false)

  const handleSummary = async () => {
    if (!selectedText) return
    setLoading(true)
    setError('')
    setResult('')
    setPlaying(false)
    try {
      const response = await fetch('http://localhost:8000/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText })
      })
      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      setError('Backend se connect nahi ho paya!')
    } finally {
      setLoading(false)
    }
  }

  const handleSpeak = () => {
    if (playing) {
      stopSpeech()
      setPlaying(false)
    } else {
      speakText(result)
      setPlaying(true)
    }
  }

  const isLongTranscript = selectedText.length > 200

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="bg-gray-800 rounded-lg p-3">
        <p className="text-xs text-gray-400 mb-1">
          {isLongTranscript ? '📹 Video Transcript' : 'Selected Text'}
        </p>
        <p className="text-sm text-white">
          {selectedText
            ? isLongTranscript
              ? '✅ Full video transcript loaded — click Summarize to analyze'
              : selectedText
            : 'Select any text on a webpage to get started...'}
        </p>
      </div>
      <button
        onClick={handleSummary}
        disabled={!selectedText || loading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 
          text-white font-medium py-2 px-4 rounded-lg transition-colors">
        {loading ? '⏳ Summarizing...' : '📝 Summarize This'}
      </button>
      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}
      <div className="bg-gray-800 rounded-lg p-3 min-h-[200px]">
        <p className="text-xs text-gray-400 mb-2">Summary</p>
        {result && (
          <button
            onClick={handleSpeak}
            className="mb-2 flex items-center gap-1 px-3 py-1 rounded-full 
                       bg-purple-700 hover:bg-purple-600 text-white text-xs font-medium">
            {playing ? '⏸️ Pause' : '🔊 Listen'}
          </button>
        )}
        <p className="text-sm text-white whitespace-pre-wrap">
          {result || 'Summary will appear here...'}
        </p>
      </div>
    </div>
  )
}

export default SummaryPage
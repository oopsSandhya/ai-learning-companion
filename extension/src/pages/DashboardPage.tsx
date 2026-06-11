import { useState, useEffect } from 'react'

interface Note {
  id: number
  selected_text: string
  note_text: string
  created_at: string
}

interface QuizResult {
  id: number
  score: number
  total: number
  created_at: string
}

interface DashboardData {
  stats: {
    total_notes: number
    total_quizzes: number
    average_score: number
  }
  recent_notes: Note[]
  recent_quizzes: QuizResult[]
}

function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/dashboard')
      if (!response.ok) throw new Error('Failed to fetch')
      const json = await response.json()
      setData(json)
    } catch (err) {
      setError('Dashboard load nahi ho paya!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <p className="text-gray-400 text-sm">⏳ Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700
            text-white text-sm py-2 rounded-lg transition-colors"
        >
          🔄 Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-bold text-white">📊 Your Learning Dashboard</h2>
        <p className="text-xs text-gray-400 mt-1">Track your progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-800 rounded-lg p-2 text-center">
          <p className="text-xl font-bold text-blue-400">
            {data?.stats.total_notes ?? 0}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">📝 Notes</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-2 text-center">
          <p className="text-xl font-bold text-green-400">
            {data?.stats.total_quizzes ?? 0}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">🧪 Quizzes</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-2 text-center">
          <p className="text-xl font-bold text-yellow-400">
            {data?.stats.average_score ?? 0}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">⭐ Avg Score</p>
        </div>
      </div>

      {/* Recent Quizzes */}
      {data?.recent_quizzes && data.recent_quizzes.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">🧪 Recent Quizzes</p>
          <div className="flex flex-col gap-2">
            {data.recent_quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-gray-800 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-blue-400">
                    {new Date(quiz.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className={`text-sm font-bold ${
                  quiz.score === quiz.total ? 'text-green-400' :
                  quiz.score >= quiz.total / 2 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {quiz.score}/{quiz.total}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Notes */}
      <div>
        <p className="text-xs text-gray-400 mb-2">📝 Recent Notes</p>
        {data?.recent_notes.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-gray-500 text-sm">No notes yet!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {data?.recent_notes.map((note) => (
              <div key={note.id} className="bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-blue-400">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                  <span className="text-xs text-gray-500">#{note.id}</span>
                </div>
                <p className="text-xs text-gray-400 truncate mb-1">
                  📌 {note.selected_text}
                </p>
                <p className="text-sm text-white">{note.note_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={fetchDashboard}
        className="w-full bg-gray-700 hover:bg-gray-600
          text-gray-300 text-sm py-2 rounded-lg transition-colors"
      >
        🔄 Refresh
      </button>
    </div>
  )
}

export default DashboardPage

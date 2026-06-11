
import { useState } from 'react'

interface QuizPageProps {
  selectedText: string
}

interface Question {
  question: string
  options: string[]
  answer: string
  explanation: string
}

function QuizPage({ selectedText }: QuizPageProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<{ [key: number]: string }>({})
  const [showScore, setShowScore] = useState(false)

  const isLongTranscript = selectedText.length > 200

  const handleQuiz = async () => {
    if (!selectedText) return
    setLoading(true)
    setError('')
    setQuestions([])
    setSelected({})
    setShowScore(false)

    try {
      const response = await fetch('http://localhost:8000/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText })
      })

      if (!response.ok) throw new Error('Server error')

      const data = await response.json()

      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions returned')
      }

      setQuestions(data.questions)
    } catch (err) {
      setError('Quiz generate nahi ho paya. Thoda aur text select karo!')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (qIndex: number, letter: string) => {
    if (selected[qIndex]) return
    setSelected(prev => ({ ...prev, [qIndex]: letter }))
  }

  const calculateScore = () => {
    return questions.reduce((score, q, i) => {
      return selected[i] === q.answer ? score + 1 : score
    }, 0)
  }

  const handleShowScore = async () => {
    const finalScore = calculateScore()
    setShowScore(true)

    try {
      await fetch('http://localhost:8000/api/quiz/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_text: selectedText.substring(0, 200),
          score: finalScore,
          total: questions.length
        })
      })
    } catch (err) {
      console.log('Could not save quiz result:', err)
    }
  }

  const allAnswered = questions.length > 0 &&
    Object.keys(selected).length === questions.length

  const getOptionStyle = (qIndex: number, letter: string) => {
    const userAnswer = selected[qIndex]
    if (!userAnswer) {
      return 'bg-gray-700 hover:bg-gray-600 cursor-pointer border border-transparent'
    }
    if (letter === questions[qIndex].answer) {
      return 'bg-green-800 border border-green-500 cursor-default'
    }
    if (letter === userAnswer) {
      return 'bg-red-800 border border-red-500 cursor-default'
    }
    return 'bg-gray-700 cursor-default opacity-40 border border-transparent'
  }

  const score = calculateScore()

  const getScoreEmoji = () => {
    const percent = (score / questions.length) * 100
    if (percent === 100) return '🏆 Perfect!'
    if (percent >= 66) return '👍 Good Job!'
    if (percent >= 33) return '📚 Keep Learning!'
    return '💪 Try Again!'
  }

  return (
    <div className="p-4 flex flex-col gap-4">

      <div className="bg-gray-800 rounded-lg p-3">
        <p className="text-xs text-gray-400 mb-1">
          {isLongTranscript ? '📹 Video Transcript' : 'Selected Text'}
        </p>
        <p className="text-sm text-white line-clamp-2">
          {selectedText
            ? isLongTranscript
              ? '✅ Full video transcript loaded — click Generate Quiz to start'
              : selectedText
            : 'Select any text on a webpage to get started...'}
        </p>
      </div>

      <button
        onClick={handleQuiz}
        disabled={!selectedText || loading}
        className="w-full bg-green-600 hover:bg-green-700
          disabled:bg-gray-600 disabled:cursor-not-allowed
          text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {loading ? '⏳ Generating Quiz...' : '🧪 Generate Quiz'}
      </button>

      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {questions.length > 0 && (
        <div className="flex flex-col gap-4">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-white font-medium mb-3">
                Q{qIndex + 1}: {q.question}
              </p>
              <div className="flex flex-col gap-2">
                {q.options.map((option, oIndex) => {
                  const letter = ['A', 'B', 'C', 'D'][oIndex]
                  return (
                    <button
                      key={oIndex}
                      onClick={() => handleSelect(qIndex, letter)}
                      className={`text-left text-sm text-white px-3 py-2
                        rounded-lg transition-colors ${getOptionStyle(qIndex, letter)}`}
                    >
                      {option}
                      {selected[qIndex] && letter === q.answer && ' ✅'}
                      {selected[qIndex] === letter && letter !== q.answer && ' ❌'}
                    </button>
                  )
                })}
              </div>
              {selected[qIndex] && (
                <p className="text-xs text-gray-400 mt-2">
                  💡 {q.explanation}
                </p>
              )}
            </div>
          ))}

          {allAnswered && !showScore && (
            <button
              onClick={handleShowScore}
              className="w-full bg-yellow-600 hover:bg-yellow-700
                text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              🎯 Show My Score
            </button>
          )}

          {showScore && (
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">
                {score}/{questions.length}
              </p>
              <p className="text-sm text-gray-400 mt-1">{getScoreEmoji()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default QuizPage
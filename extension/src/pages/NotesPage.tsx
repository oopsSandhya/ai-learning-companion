import { useState, useEffect } from 'react'
import { speakText, stopSpeech } from '../utils/speech'

interface NotesPageProps {
  selectedText: string
  _isYouTube: boolean
}

interface Note {
  id: number
  selected_text: string
  note_text: string
  created_at: string
}

function NotesPage({ selectedText}: NotesPageProps) {
  const [noteText, setNoteText] = useState<string>('')
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [playingId, setPlayingId] = useState<number | null>(null)

  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/notes')
      const data = await response.json()
      setNotes(data.notes)
    } catch (err) {
      console.log('Error fetching notes:', err)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const isLongTranscript = selectedText.length > 200

  const handleSave = async () => {
    if (!noteText.trim()) return
    setLoading(true)
    try {
      await fetch('http://localhost:8000/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // YouTube transcript ke liye sirf label save karo, pura text nahi
          selected_text: isLongTranscript
            ? '📹 YouTube Video Transcript'
            : selectedText || 'No text selected',
          note_text: noteText
        })
      })
      setNoteText('')
      fetchNotes()
    } catch (err) {
      console.log('Error saving note:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/api/notes/${id}`, { method: 'DELETE' })
      fetchNotes()
    } catch (err) {
      console.log('Error deleting note:', err)
    }
  }

  const handleSpeak = (note: Note) => {
    if (playingId === note.id) {
      stopSpeech()
      setPlayingId(null)
    } else {
      speakText(note.note_text)
      setPlayingId(note.id)
    }
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="bg-gray-800 rounded-lg p-3">
        <p className="text-xs text-gray-400 mb-1">Write a Note</p>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          className="w-full bg-gray-700 text-white text-sm rounded p-2 
            min-h-[100px] resize-none outline-none"
          placeholder="Write your notes here..."
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!noteText.trim() || loading}
        className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600
          text-white font-medium py-2 px-4 rounded-lg transition-colors">
        {loading ? '⏳ Saving...' : '📚 Save Note'}
      </button>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400">Saved Notes ({notes.length})</p>
        {notes.length === 0 && (
          <p className="text-sm text-gray-500">No notes saved yet...</p>
        )}
        {notes.map((note) => (
          <div key={note.id} className="bg-gray-800 rounded-lg p-3">
            <div className="flex justify-between items-start mb-1">
              <p className="text-xs text-blue-400">
                {new Date(note.created_at).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSpeak(note)}
                  className="text-xs px-2 py-0.5 rounded-full bg-yellow-700 
                             hover:bg-yellow-600 text-white">
                  {playingId === note.id ? '⏸️' : '🔊'}
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-red-400 text-xs hover:text-red-300">
                  🗑️
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-1 truncate">
              📌 {note.selected_text}
            </p>
            <p className="text-sm text-white">{note.note_text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotesPage
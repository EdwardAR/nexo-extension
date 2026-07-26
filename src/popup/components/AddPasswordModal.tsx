import { useState, type FormEvent } from 'react'
import { X, Globe, User, Key, FileText } from 'lucide-react'
import type { PasswordEntry } from '../types'

interface AddPasswordModalProps {
  onClose: () => void
  onSave: (entry: PasswordEntry) => void
  initialSite?: string
}

export function AddPasswordModal({ onClose, onSave, initialSite }: AddPasswordModalProps) {
  const [site, setSite] = useState(initialSite || '')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!site.trim() || !username.trim() || !password.trim()) return

    const entry: PasswordEntry = {
      id: crypto.randomUUID(),
      site: site.trim(),
      username: username.trim(),
      password,
      notes: notes.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    onSave(entry)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Add Password
          </h2>
          <button onClick={onClose} className="btn-ghost p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="Site URL (e.g. https://github.com)"
              className="input-field pl-9"
              autoFocus
              required
            />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username / Email"
              className="input-field pl-9"
              required
            />
          </div>

          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input-field pl-9"
              required
            />
          </div>

          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              className="input-field pl-9 pt-2.5 resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={!site.trim() || !username.trim() || !password.trim()}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

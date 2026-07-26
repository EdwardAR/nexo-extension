import { useState } from 'react'
import { X, Eye, EyeOff, Copy, Edit3, Trash2, Globe, User, Key, FileText, Clock } from 'lucide-react'
import type { PasswordEntry } from '../types'
import { useToast } from '../hooks/useToast'

interface ViewPasswordModalProps {
  entry: PasswordEntry
  onClose: () => void
  onUpdate: (id: string, updates: Partial<PasswordEntry>) => void
  onDelete: (id: string) => void
}

export function ViewPasswordModal({
  entry,
  onClose,
  onUpdate,
  onDelete,
}: ViewPasswordModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState(entry.username)
  const [password, setPassword] = useState(entry.password)
  const [notes, setNotes] = useState(entry.notes)
  const { addToast } = useToast()

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      addToast(`${label} copied`, 'success')
    } catch {
      addToast('Failed to copy', 'error')
    }
  }

  const handleSave = () => {
    onUpdate(entry.id, { username, password, notes })
    setEditing(false)
    addToast('Password updated', 'success')
  }

  const handleDelete = () => {
    onDelete(entry.id)
    onClose()
    addToast('Password deleted', 'success')
  }

  const domain = new URL(entry.site.startsWith('http') ? entry.site : `https://${entry.site}`).hostname

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Password Details
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditing(!editing)}
              className={`btn-ghost p-1.5 ${editing ? 'text-vault-600 dark:text-vault-400' : ''}`}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={handleDelete} className="btn-ghost p-1.5 hover:!text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="btn-ghost p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3 h-3" /> Site
            </label>
            <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{domain}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
              <User className="w-3 h-3" /> Username
            </label>
            {editing ? (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
              />
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-900 dark:text-gray-100">{entry.username}</p>
                <button
                  onClick={() => copyToClipboard(entry.username, 'Username')}
                  className="btn-ghost p-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3 h-3" /> Password
            </label>
            {editing ? (
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                  {showPassword ? entry.password : '••••••••••••'}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn-ghost p-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(entry.password, 'Password')}
                    className="btn-ghost p-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Notes
            </label>
            {editing ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field resize-none"
                rows={2}
              />
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {entry.notes || 'No notes'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 pt-1">
            <Clock className="w-3 h-3" />
            <span>Created {new Date(entry.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {editing && (
          <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button onClick={() => setEditing(false)} className="btn-ghost flex-1">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary flex-1">
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

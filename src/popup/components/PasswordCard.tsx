import { Globe, Copy, Eye, Trash2 } from 'lucide-react'
import type { PasswordEntry } from '../types'
import { useToast } from '../hooks/useToast'

interface PasswordCardProps {
  entry: PasswordEntry
  onView: (entry: PasswordEntry) => void
  onDelete: (id: string) => void
}

export function PasswordCard({ entry, onView, onDelete }: PasswordCardProps) {
  const { addToast } = useToast()

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      addToast(`${label} copied`, 'success')
    } catch {
      addToast('Failed to copy', 'error')
    }
  }

  const domain = new URL(entry.site.startsWith('http') ? entry.site : `https://${entry.site}`).hostname
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

  return (
    <div className="card group animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img
            src={favicon}
            alt=""
            className="w-5 h-5"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
              ;(e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-xs font-bold text-gray-400">' + domain[0].toUpperCase() + '</span>'
            }}
          />
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onView(entry)}>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {entry.username}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {domain}
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => copyToClipboard(entry.username, 'Username')}
            className="btn-ghost p-1.5"
            title="Copy username"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onView(entry)}
            className="btn-ghost p-1.5"
            title="View password"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="btn-ghost p-1.5 hover:!text-red-500"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

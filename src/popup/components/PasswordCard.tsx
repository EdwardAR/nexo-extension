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
    <div className="card group animate-slide-up hover:border-vault-200 dark:hover:border-vault-800/50 hover:shadow-md cursor-pointer transition-all">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
          <img
            src={favicon}
            alt=""
            className="w-6 h-6"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
              ;(e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-xs font-bold bg-gradient-to-br from-vault-500 to-vault-700 text-white w-full h-full flex items-center justify-center rounded-lg">' + domain[0].toUpperCase() + '</span>'
            }}
          />
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onView(entry)}>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-vault-600 dark:group-hover:text-vault-400 transition-colors">
            {entry.username}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {domain}
          </p>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={() => copyToClipboard(entry.username, 'Username')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:text-vault-600 dark:hover:text-vault-400 transition-colors"
            title="Copy username"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onView(entry)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:text-vault-600 dark:hover:text-vault-400 transition-colors"
            title="View password"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

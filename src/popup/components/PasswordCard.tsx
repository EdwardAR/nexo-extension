import { Copy, ChevronRight } from 'lucide-react'
import type { PasswordEntry } from '../types'
import { getFaviconUrl, getHostname } from '../../shared/site'
import { IconButton } from './IconButton'

interface PasswordCardProps {
  entry: PasswordEntry
  onView: (entry: PasswordEntry) => void
  onCopy: (text: string, label: string) => void
}

export function PasswordCard({ entry, onView, onCopy }: PasswordCardProps) {
  const domain = getHostname(entry.site)
  const initial = (domain[0] || '?').toUpperCase()

  return (
    <article className="card group relative animate-slide-up overflow-hidden p-3">
      <span className="absolute inset-y-3 left-0 w-0.5 rounded-r-full bg-vault-400 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-700">
          <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-vault-500 to-vault-700 text-sm font-bold text-white">
            {initial}
          </span>
          <img
            src={getFaviconUrl(entry.site)}
            alt=""
            className="relative h-6 w-6"
            onError={(event) => { event.currentTarget.style.display = 'none' }}
          />
        </div>

        <button
          type="button"
          onClick={() => onView(entry)}
          className="min-w-0 flex-1 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-vault-500"
          aria-label={`Ver acceso de ${domain}`}
        >
          <p className="type-section truncate text-slate-900 transition-colors group-hover:text-vault-600 dark:text-slate-100 dark:group-hover:text-vault-300">{domain}</p>
          <p className="type-secondary mt-0.5 truncate text-slate-500 dark:text-slate-400">{entry.username}</p>
        </button>

        <div className="flex items-center gap-0.5 text-slate-400">
          <IconButton label="Copiar usuario" onClick={() => onCopy(entry.username, 'Usuario')}>
            <Copy className="w-4 h-4" />
          </IconButton>
          <IconButton label="Ver detalles" onClick={() => onView(entry)}>
            <ChevronRight className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </article>
  )
}

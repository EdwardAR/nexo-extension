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
    <article className="card group animate-slide-up p-3">
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-700">
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
          <p className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-vault-600 dark:text-slate-100 dark:group-hover:text-vault-300">{domain}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{entry.username}</p>
        </button>

        <div className="flex items-center gap-0.5">
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

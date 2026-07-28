import { AlertCircle, BellRing, CalendarClock, ChevronRight, Settings2, X } from 'lucide-react'
import type { PasswordEntry } from '../types'
import { getRenewalInfo, type RenewalStatus } from '../../shared/renewal'
import { getHostname } from '../../shared/site'
import { IconButton } from './IconButton'

interface RenewalPanelProps {
  entries: PasswordEntry[]
  onClose: () => void
  onView: (entry: PasswordEntry) => void
}

const statusConfig: Record<Exclude<RenewalStatus, 'current'>, {
  label: string
  icon: typeof AlertCircle
  color: string
}> = {
  overdue: { label: 'Vencidas', icon: AlertCircle, color: 'text-red-600 dark:text-red-400' },
  'due-soon': { label: 'Próximas', icon: CalendarClock, color: 'text-amber-600 dark:text-amber-400' },
  unconfigured: { label: 'Sin configurar', icon: Settings2, color: 'text-slate-500 dark:text-slate-400' },
}

export function RenewalPanel({ entries, onClose, onView }: RenewalPanelProps) {
  const grouped = entries.reduce<Record<string, PasswordEntry[]>>((result, entry) => {
    const status = getRenewalInfo(entry).status
    if (status !== 'current') (result[status] ||= []).push(entry)
    return result
  }, {})
  const actionable = Object.values(grouped).flat().length

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal-content" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="renewal-title">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <BellRing className="h-5 w-5" />
            </span>
            <div>
              <h2 id="renewal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">Renovaciones</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {actionable ? `${actionable} acceso${actionable === 1 ? '' : 's'} requiere revisión` : 'Todo está al día'}
              </p>
            </div>
          </div>
          <IconButton label="Cerrar" onClick={onClose}><X className="h-4 w-4" /></IconButton>
        </div>

        {actionable === 0 ? (
          <div className="rounded-xl bg-emerald-50 p-5 text-center dark:bg-emerald-950/30">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">No hay renovaciones pendientes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(['overdue', 'due-soon', 'unconfigured'] as const).map((status) => {
              const items = grouped[status] || []
              if (!items.length) return null
              const config = statusConfig[status]
              const StatusIcon = config.icon
              return (
                <section key={status}>
                  <h3 className={`mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${config.color}`}>
                    <StatusIcon className="h-3.5 w-3.5" /> {config.label} · {items.length}
                  </h3>
                  <div className="space-y-2">
                    {items.map((entry) => {
                      const info = getRenewalInfo(entry)
                      return (
                        <button
                          key={entry.id}
                          onClick={() => { onView(entry); onClose() }}
                          className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-vault-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-vault-700"
                        >
                          <span className="min-w-0 flex-1">
                            <strong className="block truncate text-sm text-slate-900 dark:text-slate-100">{getHostname(entry.site)}</strong>
                            <small className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                              {status === 'unconfigured'
                                ? 'Indica la fecha del último cambio'
                                : `Renovación: ${new Date(`${info.dueOn}T00:00:00`).toLocaleDateString('es-PE')}`}
                            </small>
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </button>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

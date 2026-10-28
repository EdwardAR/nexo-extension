import { AlertCircle, Bell, CalendarClock, ChevronRight, Settings2, X } from 'lucide-react'
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
  surface: string
}> = {
  overdue: {
    label: 'Vencidas',
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    surface: 'border-red-100 bg-red-50/70 dark:border-red-900/50 dark:bg-red-950/25',
  },
  'due-soon': {
    label: 'Próximas',
    icon: CalendarClock,
    color: 'text-amber-600 dark:text-amber-400',
    surface: 'border-amber-100 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/25',
  },
  unconfigured: {
    label: 'Sin configurar',
    icon: Settings2,
    color: 'text-slate-500 dark:text-slate-400',
    surface: 'border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/70',
  },
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
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-amber-50 text-amber-600 shadow-sm ring-1 ring-amber-100/80 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900/50">
              <Bell className="icon-action" />
            </span>
            <div className="min-w-0">
              <h2 id="renewal-title" className="type-section text-slate-900 dark:text-slate-100">Renovaciones</h2>
              <p className="type-secondary mt-0.5 text-slate-500 dark:text-slate-400">
                {actionable ? `${actionable} acceso${actionable === 1 ? '' : 's'} requiere revisión` : 'Todo está al día'}
              </p>
            </div>
          </div>
          <IconButton label="Cerrar" onClick={onClose}><X className="h-4 w-4" /></IconButton>
        </div>

        {actionable === 0 ? (
          <div className="rounded-xl bg-emerald-50 p-5 text-center dark:bg-emerald-950/30">
            <p className="type-body font-semibold text-emerald-700 dark:text-emerald-300">No hay renovaciones pendientes</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {(['overdue', 'due-soon', 'unconfigured'] as const).map((status) => {
              const items = grouped[status] || []
              if (!items.length) return null
              const config = statusConfig[status]
              const StatusIcon = config.icon
              return (
                <section key={status}>
                  <h3 className={`type-label mb-2 flex items-center gap-1.5 ${config.color}`}>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 ${config.surface}`}>
                      <StatusIcon className="icon-status" />
                      <span>{config.label}</span>
                      <span aria-label={`${items.length} elementos`}>{items.length}</span>
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {items.map((entry) => {
                      const info = getRenewalInfo(entry)
                      return (
                        <button
                          key={entry.id}
                          onClick={() => { onView(entry); onClose() }}
                          aria-label={`Abrir renovación de ${getHostname(entry.site)}`}
                          className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition duration-150 hover:-translate-y-px hover:border-vault-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-vault-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-vault-700 dark:focus-visible:ring-offset-slate-800"
                        >
                          <span className="min-w-0 flex-1">
                            <strong className="type-section block truncate text-slate-900 dark:text-slate-100">{getHostname(entry.site)}</strong>
                            <small className="type-secondary mt-0.5 block truncate text-slate-500 dark:text-slate-400">
                              {status === 'unconfigured'
                                ? 'Indica la fecha del último cambio'
                                : `Renovación: ${new Date(`${info.dueOn}T00:00:00`).toLocaleDateString('es-PE')}`}
                            </small>
                          </span>
                          <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-vault-50 group-hover:text-vault-600 dark:bg-slate-700/80 dark:text-slate-400 dark:group-hover:bg-vault-950/50 dark:group-hover:text-vault-300">
                            <ChevronRight className="h-4 w-4" />
                          </span>
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

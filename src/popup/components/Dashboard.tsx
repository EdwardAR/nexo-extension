import { useState, useMemo } from 'react'
import { Search, Plus, LockKeyhole, Orbit, X, DatabaseBackup, BellRing, Clock3, KeyRound } from 'lucide-react'
import type { PasswordEntry } from '../types'
import { PasswordCard } from './PasswordCard'
import { EmptyState } from './EmptyState'
import { ThemeToggle } from './ThemeToggle'
import { IconButton } from './IconButton'
import { getRenewalInfo } from '../../shared/renewal'

interface DashboardProps {
  entries: PasswordEntry[]
  onAdd: () => void
  onView: (entry: PasswordEntry) => void
  onCopy: (text: string, label: string) => void
  onLock: () => void
  onOpenData: () => void
  onOpenRenewals: () => void
  onOpenTime: () => void
  dark: boolean
  onToggleTheme: () => void
}

export function Dashboard({
  entries,
  onAdd,
  onView,
  onCopy,
  onLock,
  onOpenData,
  onOpenRenewals,
  onOpenTime,
  dark,
  onToggleTheme,
}: DashboardProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      entries.filter(
        (e) =>
          e.site.toLowerCase().includes(search.toLowerCase()) ||
          e.username.toLowerCase().includes(search.toLowerCase())
      ),
    [entries, search]
  )
  const renewalCount = useMemo(
    () => entries.filter((entry) => getRenewalInfo(entry).status !== 'current').length,
    [entries]
  )

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-vault-900 to-cyan-900 px-5 pb-7 pt-4">
        <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-36 w-36 rounded-full bg-vault-400/20 blur-3xl" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/15 shadow-inner backdrop-blur">
              <Orbit className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">Nexo</h1>
              <p className="text-xs text-cyan-100/70">Tu centro digital</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle dark={dark} onToggle={onToggleTheme} inverse />
            <IconButton label="Importar o exportar datos" onClick={onOpenData} tone="inverse">
              <DatabaseBackup className="h-4 w-4" />
            </IconButton>
            <IconButton label="Bloquear bóveda" onClick={onLock} tone="inverse">
              <LockKeyhole className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/70">Bóveda protegida</p>
            <p className="mt-1 text-lg font-semibold text-white">{entries.length} {entries.length === 1 ? 'acceso seguro' : 'accesos seguros'}</p>
          </div>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200">● Activa</span>
        </div>
      </header>

      <nav className="relative -mt-4 grid grid-cols-2 gap-2.5 px-4" aria-label="Módulos de Nexo">
        <button onClick={onOpenTime} className="group rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-md shadow-slate-200/50 transition hover:-translate-y-0.5 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none dark:hover:border-cyan-700">
          <span className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 transition group-hover:bg-cyan-100 dark:bg-cyan-950/60 dark:text-cyan-300"><Clock3 className="h-4 w-4" /></span>
          <strong className="block text-xs text-slate-900 dark:text-white">Horarios</strong>
          <small className="text-[10px] text-slate-400">Alertas</small>
        </button>
        <button onClick={onOpenRenewals} className="group relative rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-md shadow-slate-200/50 transition hover:-translate-y-0.5 hover:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none dark:hover:border-amber-700">
          <span className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300"><BellRing className="h-4 w-4" /></span>
          <strong className="block text-xs text-slate-900 dark:text-white">Renovar</strong>
          <small className="text-[10px] text-slate-400">{renewalCount ? `${renewalCount} pendiente${renewalCount === 1 ? '' : 's'}` : 'Al día'}</small>
          {renewalCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-800" />}
        </button>
      </nav>

      <div className="px-4 pb-3 pt-3.5">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
          <KeyRound className="h-3.5 w-3.5 text-vault-500" /> Contraseñas
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-vault-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar sitio o usuario"
            aria-label="Buscar contraseñas"
            className="input-field bg-white pl-10 pr-10 shadow-sm dark:bg-slate-800"
            autoFocus
          />
          {search && (
            <IconButton
              label="Limpiar búsqueda"
              onClick={() => setSearch('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </IconButton>
          )}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        {filtered.length === 0 ? (
          search ? (
            <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
              <div className="mb-3 rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Sin resultados</p>
              <p className="mt-1 text-xs text-slate-500">No encontramos “{search}”</p>
            </div>
          ) : (
            <EmptyState onAdd={onAdd} />
          )
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => (
              <PasswordCard
                key={entry.id}
                entry={entry}
                onView={onView}
                onCopy={onCopy}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <button onClick={onAdd} className="btn-primary flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Agregar contraseña
        </button>
      </footer>
    </div>
  )
}

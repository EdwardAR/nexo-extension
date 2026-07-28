import { useState, useMemo } from 'react'
import { Search, Plus, LockKeyhole, ShieldCheck, X, DatabaseBackup } from 'lucide-react'
import type { PasswordEntry } from '../types'
import { PasswordCard } from './PasswordCard'
import { EmptyState } from './EmptyState'
import { ThemeToggle } from './ThemeToggle'
import { IconButton } from './IconButton'

interface DashboardProps {
  entries: PasswordEntry[]
  onAdd: () => void
  onView: (entry: PasswordEntry) => void
  onCopy: (text: string, label: string) => void
  onLock: () => void
  onOpenData: () => void
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

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <header className="relative overflow-hidden bg-gradient-to-br from-vault-600 via-vault-700 to-vault-900 px-5 pb-5 pt-4">
        <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-white/10 blur-sm" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/15 shadow-inner backdrop-blur">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">PassSave</h1>
              <p className="text-xs text-vault-100">
                {entries.length} {entries.length === 1 ? 'acceso guardado' : 'accesos guardados'}
              </p>
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
      </header>

      <div className="-mt-1 px-4 pb-4 pt-3">
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

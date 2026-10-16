import { useMemo, useState } from 'react'
import { ArrowLeft, KeyRound, Plus, Search, X } from 'lucide-react'
import type { PasswordEntry } from '../types'
import { EmptyState } from './EmptyState'
import { IconButton } from './IconButton'
import { PasswordCard } from './PasswordCard'

interface PasswordsPanelProps {
  entries: PasswordEntry[]
  onClose: () => void
  onAdd: () => void
  onView: (entry: PasswordEntry) => void
  onCopy: (text: string, label: string) => void
}

export function PasswordsPanel({ entries, onClose, onAdd, onView, onCopy }: PasswordsPanelProps) {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return entries
    return entries.filter((entry) =>
      entry.site.toLowerCase().includes(query) || entry.username.toLowerCase().includes(query)
    )
  }, [entries, search])

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-vault-900 to-cyan-900 px-4 pb-8 pt-4">
        <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-16 h-20 w-32 rounded-full bg-vault-300/15 blur-2xl" />
        <div className="relative flex items-center gap-3 text-white">
          <IconButton label="Volver" onClick={onClose} tone="inverse"><ArrowLeft className="h-4 w-4" /></IconButton>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><KeyRound className="h-5 w-5" /></span>
          <div>
            <h1 className="type-brand">Contraseñas</h1>
            <p className="type-secondary text-cyan-100/80">{entries.length} {entries.length === 1 ? 'acceso seguro' : 'accesos seguros'}</p>
          </div>
        </div>
      </header>

      <div className="relative -mt-4 px-4 pb-3">
        <div className="group relative rounded-2xl bg-white shadow-lg shadow-slate-300/25 dark:bg-slate-800 dark:shadow-none">
          <Search className="icon-input absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-vault-600" />
          <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar sitio o usuario" aria-label="Buscar contraseñas" className="input-field border-transparent bg-transparent pl-10 pr-10 shadow-none hover:border-transparent dark:border-transparent dark:bg-transparent" autoFocus />
          {search && (
            <IconButton label="Limpiar búsqueda" onClick={() => setSearch('')} className="absolute right-1.5 top-1/2 -translate-y-1/2"><X className="h-4 w-4" /></IconButton>
          )}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="mb-2.5 flex items-center justify-between px-1">
          <h2 className="type-label text-slate-500 dark:text-slate-400">{search ? 'Resultados' : 'Tus accesos'}</h2>
          <span className="type-secondary rounded-full bg-slate-200/70 px-2 py-0.5 font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{filtered.length}</span>
        </div>
        {filtered.length === 0 ? (
          search ? (
            <div className="flex animate-fade-in flex-col items-center justify-center py-12">
              <div className="mb-3 rounded-full bg-slate-100 p-3 dark:bg-slate-800"><Search className="h-6 w-6 text-slate-400" /></div>
              <p className="type-body font-medium text-slate-700 dark:text-slate-300">Sin resultados</p>
              <p className="type-secondary mt-1 text-slate-500">No encontramos “{search}”</p>
            </div>
          ) : <EmptyState onAdd={onAdd} />
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => <PasswordCard key={entry.id} entry={entry} onView={onView} onCopy={onCopy} />)}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <button onClick={onAdd} className="btn-primary flex items-center justify-center gap-2"><Plus className="h-4 w-4" />Agregar contraseña</button>
      </footer>
    </div>
  )
}

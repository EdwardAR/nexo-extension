import { useState, useMemo } from 'react'
import { Search, Plus, LogOut, ShieldCheck } from 'lucide-react'
import type { PasswordEntry } from '../types'
import { PasswordCard } from './PasswordCard'
import { EmptyState } from './EmptyState'

interface DashboardProps {
  entries: PasswordEntry[]
  onAdd: () => void
  onView: (entry: PasswordEntry) => void
  onDelete: (id: string) => void
  onLock: () => void
}

export function Dashboard({
  entries,
  onAdd,
  onView,
  onDelete,
  onLock,
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
    <div className="flex flex-col h-screen">
      <header className="bg-gradient-to-r from-vault-600 to-vault-700 dark:from-vault-800 dark:to-vault-900 px-4 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 backdrop-blur">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">
                Password Vault
              </h1>
              <p className="text-xs text-white/70">
                {entries.length} {entries.length === 1 ? 'password' : 'passwords'} saved
              </p>
            </div>
          </div>
          <button onClick={onLock} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Lock vault">
            <LogOut className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-vault-600 dark:group-focus-within:text-vault-400 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by site or username..."
            className="input-field pl-10 pr-4 bg-white dark:bg-gray-700"
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filtered.length === 0 ? (
          search ? (
            <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
              <Search className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No results for "{search}"
              </p>
            </div>
          ) : (
            <EmptyState onAdd={onAdd} />
          )
        ) : (
          <div className="space-y-2 pt-1">
            {filtered.map((entry) => (
              <PasswordCard
                key={entry.id}
                entry={entry}
                onView={onView}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      <footer className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <button onClick={onAdd} className="btn-primary flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Add Password
        </button>
      </footer>
    </div>
  )
}

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
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-vault-600 dark:text-vault-400" />
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Password Vault
          </h1>
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
            {entries.length}
          </span>
        </div>
        <button onClick={onLock} className="btn-ghost p-1.5" title="Lock vault">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search passwords..."
            className="input-field pl-9"
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

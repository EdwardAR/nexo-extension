import { ShieldOff, Plus } from 'lucide-react'

interface EmptyStateProps {
  onAdd: () => void
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 animate-fade-in">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <ShieldOff className="w-7 h-7 text-gray-400 dark:text-gray-500" />
      </div>
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
        No passwords yet
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 max-w-[240px]">
        Save your first password and we will auto-fill it for you on login pages
      </p>
      <button onClick={onAdd} className="btn-primary !w-auto flex items-center gap-2 px-5">
        <Plus className="w-4 h-4" />
        Add Password
      </button>
    </div>
  )
}

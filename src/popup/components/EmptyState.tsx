import { ShieldOff, Plus } from 'lucide-react'

interface EmptyStateProps {
  onAdd: () => void
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mb-5 shadow-lg">
        <ShieldOff className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
        Your vault is empty
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8 max-w-[260px] leading-relaxed">
        Get started by adding your first password. It'll be encrypted and ready to auto-fill on any website.
      </p>
      <button onClick={onAdd} className="btn-primary !w-auto flex items-center gap-2 px-6 py-2.5 shadow-lg shadow-vault-600/30 hover:shadow-lg hover:shadow-vault-700/40">
        <Plus className="w-5 h-5" />
        <span>Add Your First Password</span>
      </button>
    </div>
  )
}

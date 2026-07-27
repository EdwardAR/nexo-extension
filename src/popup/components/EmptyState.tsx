import { KeyRound, Plus, ShieldCheck } from 'lucide-react'

interface EmptyStateProps {
  onAdd: () => void
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-vault-100 bg-vault-50 dark:border-vault-900 dark:bg-vault-950/50">
        <KeyRound className="h-9 w-9 text-vault-600 dark:text-vault-300" />
        <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-slate-50 bg-emerald-500 p-1.5 text-white dark:border-slate-900">
          <ShieldCheck className="h-3.5 w-3.5" />
        </span>
      </div>
      <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">Tu bóveda está lista</h2>
      <p className="mb-6 max-w-[260px] text-center text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Guarda tu primer acceso para tenerlo protegido y disponible cuando lo necesites.
      </p>
      <button onClick={onAdd} className="btn-primary !w-auto flex items-center gap-2 px-5">
        <Plus className="h-4 w-4" />
        <span>Agregar primer acceso</span>
      </button>
    </div>
  )
}

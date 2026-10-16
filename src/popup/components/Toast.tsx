import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import type { ToastMessage } from '../types'

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastMessage
  onRemove: (id: string) => void
}) {
  const icons = {
    success: <CheckCircle className="icon-status text-green-500" />,
    error: <XCircle className="icon-status text-red-500" />,
    info: <Info className="icon-status text-vault-500" />,
  }

  const borders = {
    success: 'border-green-200 dark:border-green-800',
    error: 'border-red-200 dark:border-red-800',
    info: 'border-vault-200 dark:border-vault-800',
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${borders[toast.type]}
        bg-white shadow-xl animate-slide-up dark:bg-slate-800`}
      role="status"
    >
      {icons[toast.type]}
      <span className="type-body flex-1 text-gray-700 dark:text-gray-300">
        {toast.message}
      </span>
      <button aria-label="Cerrar notificación" onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        <X className="icon-status" />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

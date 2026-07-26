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
    success: <CheckCircle className="w-4 h-4 text-green-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />,
    info: <Info className="w-4 h-4 text-vault-500" />,
  }

  const borders = {
    success: 'border-green-200 dark:border-green-800',
    error: 'border-red-200 dark:border-red-800',
    info: 'border-vault-200 dark:border-vault-800',
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${borders[toast.type]}
        bg-white dark:bg-gray-800 shadow-lg animate-slide-up`}
    >
      {icons[toast.type]}
      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
        {toast.message}
      </span>
      <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        <X className="w-3.5 h-3.5" />
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

import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
  tone?: 'neutral' | 'danger' | 'inverse'
}

const tones = {
  neutral: 'text-slate-500 hover:bg-slate-100 hover:text-vault-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-vault-300',
  danger: 'text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400',
  inverse: 'text-white/80 hover:bg-white/15 hover:text-white',
}

export function IconButton({
  label,
  children,
  tone = 'neutral',
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`icon-button ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

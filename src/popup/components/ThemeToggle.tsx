import { Sun, Moon } from 'lucide-react'
import { IconButton } from './IconButton'

interface ThemeToggleProps {
  dark: boolean
  onToggle: () => void
  inverse?: boolean
}

export function ThemeToggle({ dark, onToggle, inverse = false }: ThemeToggleProps) {
  return (
    <IconButton
      onClick={onToggle}
      label={dark ? 'Usar tema claro' : 'Usar tema oscuro'}
      tone={inverse ? 'inverse' : 'neutral'}
    >
      {dark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </IconButton>
  )
}

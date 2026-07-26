import { useState, type FormEvent } from 'react'
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'

interface LockScreenProps {
  onUnlock: (password: string) => Promise<boolean>
  loading: boolean
}

export function LockScreen({ onUnlock, loading }: LockScreenProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setError('')
    const success = await onUnlock(password)
    if (!success) {
      setError('Incorrect master password')
      setPassword('')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-vault-100 dark:bg-vault-900/50 mb-4">
        <ShieldCheck className="w-7 h-7 text-vault-600 dark:text-vault-400" />
      </div>

      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
        Password Vault
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center">
        Enter your master password to unlock
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            placeholder="Master password"
            className="input-field pl-9 pr-10"
            autoFocus
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400 text-center animate-fade-in">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password.trim()}
          className="btn-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          {loading ? 'Unlocking...' : 'Unlock'}
        </button>
      </form>
    </div>
  )
}

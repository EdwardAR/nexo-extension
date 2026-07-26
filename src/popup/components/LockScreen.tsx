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
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 animate-fade-in bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-vault-500 to-vault-700 mb-6 shadow-lg shadow-vault-500/30">
        <ShieldCheck className="w-8 h-8 text-white" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Password Vault
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-10 text-center max-w-xs">
        Secure your digital life with military-grade encryption
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-vault-600 dark:group-focus-within:text-vault-400 transition-colors" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            placeholder="Master password"
            className="input-field pl-10 pr-11 text-base"
            autoFocus
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-vault-600 dark:hover:text-vault-400 transition-colors p-1"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800 animate-shake">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password.trim()}
          className="btn-primary flex items-center justify-center gap-2 py-3 text-base font-semibold shadow-lg shadow-vault-600/40 hover:shadow-lg hover:shadow-vault-700/40"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Lock className="w-5 h-5" />
          )}
          {loading ? 'Unlocking...' : 'Unlock Vault'}
        </button>
      </form>

      <p className="text-xs text-gray-500 dark:text-gray-500 mt-8 text-center max-w-xs">
        Your master password is never stored or transmitted. Only you can access your vault.
      </p>
    </div>
  )
}

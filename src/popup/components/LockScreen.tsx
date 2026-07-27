import { useState, type FormEvent } from 'react'
import { LockKeyhole, Eye, EyeOff, ShieldCheck, Sparkles, Shield } from 'lucide-react'
import { IconButton } from './IconButton'

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
      setError('La contraseña maestra es incorrecta')
      setPassword('')
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 px-7 py-8 dark:bg-slate-950">
      <div className="pointer-events-none absolute left-1/2 top-[-110px] h-72 w-72 -translate-x-1/2 rounded-full bg-vault-200/60 blur-3xl dark:bg-vault-900/40" />
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-vault-500 to-vault-800 shadow-xl shadow-vault-500/25">
        <ShieldCheck className="h-8 w-8 text-white" />
        <Sparkles className="absolute -right-2 -top-2 h-5 w-5 text-vault-300" />
      </div>

      <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-vault-600 dark:text-vault-300">Tu bóveda personal</p>
      <h1 className="relative mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Bienvenido a PassSave</h1>
      <p className="relative mb-8 mt-2 max-w-xs text-center text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Desbloquea tus accesos de forma segura.
      </p>

      <form onSubmit={handleSubmit} className="relative w-full max-w-xs space-y-4">
        <label className="form-field">
          <span>Contraseña maestra</span>
          <LockKeyhole className="field-icon" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            placeholder="Ingresa tu contraseña"
            className="input-field pl-10 pr-11"
            autoFocus
            spellCheck={false}
          />
          <IconButton
            label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute bottom-1.5 right-1.5"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </IconButton>
        </label>

        {error && (
          <div className="animate-shake rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30" role="alert">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password.trim()}
          className="btn-primary flex items-center justify-center gap-2 py-3 shadow-lg shadow-vault-600/25"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <LockKeyhole className="w-5 h-5" />
          )}
          {loading ? 'Desbloqueando…' : 'Desbloquear bóveda'}
        </button>
      </form>

      <div className="relative mt-8 flex max-w-xs items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white/70 p-3 text-xs leading-relaxed text-slate-500 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <Shield className="mt-0.5 h-4 w-4 flex-none text-vault-500" />
        Tu contraseña maestra no se almacena ni se transmite.
      </div>
    </main>
  )
}

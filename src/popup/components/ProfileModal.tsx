import { useState, type FormEvent } from 'react'
import { Save, User, X } from 'lucide-react'
import { IconButton } from './IconButton'

interface ProfileModalProps {
  name: string
  onClose: () => void
  onSave: (name: string) => Promise<boolean>
}

export function ProfileModal({ name, onClose, onSave }: ProfileModalProps) {
  const [profileName, setProfileName] = useState(name)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!profileName.trim()) {
      setError('Ingresa un nombre de usuario')
      return
    }

    setError('')
    setSaving(true)
    try {
      if (await onSave(profileName)) onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
      >
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-vault-50 text-vault-600 dark:bg-vault-950/60 dark:text-vault-300">
              <User className="icon-action" aria-hidden="true" />
            </span>
            <div>
              <h2 id="profile-title" className="type-section text-slate-900 dark:text-slate-100">Ajustes de perfil</h2>
              <p className="type-secondary mt-0.5 text-slate-500 dark:text-slate-400">Personaliza el saludo de Nexo.</p>
            </div>
          </div>
          <IconButton label="Cerrar ajustes de perfil" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        <form onSubmit={handleSubmit} className="profile-form" noValidate>
          <label className="form-field profile-field">
            <span>Nombre de usuario</span>
            <User className="field-icon" aria-hidden="true" />
            <input
              id="profile-name"
              type="text"
              value={profileName}
              onChange={(event) => {
                setProfileName(event.target.value)
                setError('')
              }}
              placeholder="Ingresa tu nombre"
              className="input-field pl-10"
              autoComplete="username"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'profile-error' : 'profile-help'}
              required
              autoFocus
            />
            <small id="profile-help" className="profile-help type-secondary mt-2 block">Se guarda solo en este dispositivo.</small>
          </label>

          {error && (
            <p id="profile-error" className="profile-error type-body mt-3 font-medium text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <div className="profile-actions mt-6 flex gap-2">
            <button type="button" onClick={onClose} className="btn-ghost flex flex-1 items-center justify-center py-2.5">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex flex-1 items-center justify-center gap-2">
              {saving ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                  Guardando…
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Guardar
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

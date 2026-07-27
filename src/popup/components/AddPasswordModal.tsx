import { useState, type FormEvent } from 'react'
import { X, Globe, User, KeyRound, FileText, Eye, EyeOff, Save } from 'lucide-react'
import type { PasswordEntry } from '../types'
import { IconButton } from './IconButton'

interface AddPasswordModalProps {
  onClose: () => void
  onSave: (entry: PasswordEntry) => Promise<boolean>
  initialSite?: string
}

export function AddPasswordModal({ onClose, onSave, initialSite }: AddPasswordModalProps) {
  const [site, setSite] = useState(initialSite || '')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [notes, setNotes] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!site.trim() || !username.trim() || !password) return

    const now = Date.now()
    const entry: PasswordEntry = {
      id: crypto.randomUUID(),
      site: site.trim(),
      username: username.trim(),
      password,
      notes: notes.trim(),
      createdAt: now,
      updatedAt: now,
    }

    setSaving(true)
    try {
      if (await onSave(entry)) onClose()
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
        aria-labelledby="add-title"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 id="add-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">Nuevo acceso</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Se cifrará antes de guardarse.</p>
          </div>
          <IconButton label="Cerrar" onClick={onClose}><X className="h-4 w-4" /></IconButton>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="form-field">
            <span>Sitio web</span>
            <Globe className="field-icon" />
            <input
              type="text"
              value={site}
              onChange={(event) => setSite(event.target.value)}
              placeholder="github.com"
              className="input-field pl-9"
              autoFocus
              required
            />
          </label>

          <label className="form-field">
            <span>Usuario o correo</span>
            <User className="field-icon" />
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="nombre@correo.com"
              className="input-field pl-9"
              required
            />
          </label>

          <label className="form-field">
            <span>Contraseña</span>
            <KeyRound className="field-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa la contraseña"
              className="input-field pl-9 pr-10"
              required
            />
            <IconButton
              label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute bottom-1.5 right-1.5"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </IconButton>
          </label>

          <label className="form-field">
            <span>Notas <small>(opcional)</small></span>
            <FileText className="field-icon field-icon-top" />
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Información adicional"
              className="input-field resize-none pl-9 pt-2.5"
              rows={2}
            />
          </label>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancelar</button>
            <button
              type="submit"
              className="btn-primary flex flex-1 items-center justify-center gap-2"
              disabled={saving || !site.trim() || !username.trim() || !password}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

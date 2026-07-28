import { useEffect, useState, type FormEvent } from 'react'
import {
  AlertTriangle, CalendarDays, Eye, EyeOff, FileText,
  Globe, KeyRound, RefreshCw, Save, User, X,
} from 'lucide-react'
import type { PasswordDraft, PasswordEntry } from '../types'
import { DEFAULT_RENEWAL_MONTHS, toLocalDateString } from '../../shared/renewal'
import { IconButton } from './IconButton'

interface AddPasswordModalProps {
  onClose: () => void
  onSave: (entry: PasswordEntry) => Promise<boolean>
  onDraftChange: (draft: PasswordDraft) => Promise<void>
  onDiscard: () => Promise<void>
  initialDraft?: PasswordDraft | null
  initialSite?: string
}

export function AddPasswordModal({
  onClose,
  onSave,
  onDraftChange,
  onDiscard,
  initialDraft,
  initialSite,
}: AddPasswordModalProps) {
  const [site, setSite] = useState(initialDraft?.site || initialSite || '')
  const [username, setUsername] = useState(initialDraft?.username || '')
  const [password, setPassword] = useState(initialDraft?.password || '')
  const [notes, setNotes] = useState(initialDraft?.notes || '')
  const [passwordChangedOn, setPasswordChangedOn] = useState(
    initialDraft?.passwordChangedOn || toLocalDateString()
  )
  const [renewalIntervalMonths, setRenewalIntervalMonths] = useState(
    initialDraft?.renewalIntervalMonths || DEFAULT_RENEWAL_MONTHS
  )
  const [showPassword, setShowPassword] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [saving, setSaving] = useState(false)

  const hasContent = Boolean(site || username || password || notes)
  const draft = (): PasswordDraft => ({
    site,
    username,
    password,
    notes,
    passwordChangedOn,
    renewalIntervalMonths,
    updatedAt: Date.now(),
  })

  useEffect(() => {
    if (!hasContent) return
    const timer = window.setTimeout(() => void onDraftChange(draft()), 400)
    return () => window.clearTimeout(timer)
  }, [site, username, password, notes, passwordChangedOn, renewalIntervalMonths])

  useEffect(() => {
    const persistWhenHidden = () => {
      if (document.visibilityState === 'hidden' && hasContent) {
        void onDraftChange(draft())
      }
    }
    document.addEventListener('visibilitychange', persistWhenHidden)
    return () => document.removeEventListener('visibilitychange', persistWhenHidden)
  }, [site, username, password, notes, passwordChangedOn, renewalIntervalMonths])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!site.trim() || !username.trim() || !password || !passwordChangedOn) return

    const now = Date.now()
    setSaving(true)
    try {
      if (await onSave({
        id: crypto.randomUUID(),
        site: site.trim(),
        username: username.trim(),
        password,
        notes: notes.trim(),
        passwordChangedOn,
        renewalIntervalMonths,
        createdAt: now,
        updatedAt: now,
      })) onClose()
    } finally {
      setSaving(false)
    }
  }

  const discard = async () => {
    await onDiscard()
    onClose()
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
            <h2 id="add-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {initialDraft ? 'Continuar borrador' : 'Nuevo acceso'}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {initialDraft ? 'Recuperamos la información cifrada.' : 'Se cifrará antes de guardarse.'}
            </p>
          </div>
          <IconButton label="Descartar o cerrar" onClick={() => hasContent ? setConfirmDiscard(true) : onClose()}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="form-field">
            <span>Sitio web</span>
            <Globe className="field-icon" />
            <input value={site} onChange={(event) => setSite(event.target.value)} placeholder="github.com" className="input-field pl-9" autoFocus required />
          </label>

          <label className="form-field">
            <span>Usuario o correo</span>
            <User className="field-icon" />
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="nombre@correo.com" className="input-field pl-9" required />
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

          <div className="grid grid-cols-[1fr_110px] gap-3">
            <label className="form-field">
              <span>Último cambio</span>
              <CalendarDays className="field-icon" />
              <input type="date" value={passwordChangedOn} onChange={(event) => setPasswordChangedOn(event.target.value)} className="input-field pl-9" required />
            </label>
            <label className="form-field">
              <span>Renovar cada</span>
              <RefreshCw className="field-icon" />
              <input
                type="number"
                min={1}
                max={24}
                value={renewalIntervalMonths}
                onChange={(event) => setRenewalIntervalMonths(Math.max(1, Math.min(24, Number(event.target.value))))}
                className="input-field pl-9 pr-2"
                aria-label="Meses entre renovaciones"
                required
              />
            </label>
          </div>

          <label className="form-field">
            <span>Notas <small>(opcional)</small></span>
            <FileText className="field-icon field-icon-top" />
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Información adicional" className="input-field resize-none pl-9 pt-2.5" rows={2} />
          </label>

          {confirmDiscard ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4" /> ¿Descartar el borrador?
              </p>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">La información escrita se eliminará.</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setConfirmDiscard(false)} className="btn-ghost flex-1">Continuar editando</button>
                <button type="button" onClick={discard} className="btn-danger flex-1">Descartar</button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => hasContent ? setConfirmDiscard(true) : onClose()} className="btn-ghost flex-1">Cancelar</button>
              <button
                type="submit"
                className="btn-primary flex flex-1 items-center justify-center gap-2"
                disabled={saving || !site.trim() || !username.trim() || !password || !passwordChangedOn}
              >
                <Save className="h-4 w-4" /> {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

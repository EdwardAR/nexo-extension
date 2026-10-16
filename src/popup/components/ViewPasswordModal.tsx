import { useState } from 'react'
import {
  X, Eye, EyeOff, Copy, Pencil, Trash2, Globe, User,
  KeyRound, FileText, Clock, Save, AlertTriangle, CalendarDays, RefreshCw,
} from 'lucide-react'
import type { PasswordEntry } from '../types'
import { getHostname } from '../../shared/site'
import { IconButton } from './IconButton'
import {
  DEFAULT_RENEWAL_MONTHS,
  getRenewalInfo,
  toLocalDateString,
} from '../../shared/renewal'

interface ViewPasswordModalProps {
  entry: PasswordEntry
  onClose: () => void
  onUpdate: (id: string, updates: Partial<PasswordEntry>) => Promise<boolean>
  onDelete: (id: string) => Promise<boolean>
  onCopy: (text: string, label: string) => void
}

export function ViewPasswordModal({
  entry,
  onClose,
  onUpdate,
  onDelete,
  onCopy,
}: ViewPasswordModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [editing, setEditing] = useState(false)
  const [site, setSite] = useState(entry.site)
  const [username, setUsername] = useState(entry.username)
  const [password, setPassword] = useState(entry.password)
  const [notes, setNotes] = useState(entry.notes)
  const [passwordChangedOn, setPasswordChangedOn] = useState(entry.passwordChangedOn || '')
  const [renewalIntervalMonths, setRenewalIntervalMonths] = useState(
    entry.renewalIntervalMonths || DEFAULT_RENEWAL_MONTHS
  )
  const [confirmRenewal, setConfirmRenewal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const domain = getHostname(site)
  const renewal = getRenewalInfo(entry)

  const saveChanges = async (changedOn = passwordChangedOn) => {
    if (!site.trim() || !username.trim() || !password) return
    setBusy(true)
    try {
      const updated = await onUpdate(entry.id, {
        site: site.trim(),
        username: username.trim(),
        password,
        notes: notes.trim(),
        passwordChangedOn: changedOn || undefined,
        renewalIntervalMonths,
      })
      if (updated) {
        setPasswordChangedOn(changedOn)
        setConfirmRenewal(false)
        setEditing(false)
      }
    } finally {
      setBusy(false)
    }
  }

  const handleSave = () => {
    if (password !== entry.password) setConfirmRenewal(true)
    else void saveChanges()
  }

  const handleDelete = async () => {
    setBusy(true)
    try {
      if (await onDelete(entry.id)) onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="type-label text-vault-600 dark:text-vault-300">Detalle del acceso</p>
            <h2 id="detail-title" className="type-section mt-1 truncate text-slate-900 dark:text-slate-100">{domain}</h2>
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              label={editing ? 'Cancelar edición' : 'Editar acceso'}
              onClick={() => setEditing((value) => !value)}
              className={editing ? '!text-vault-600 dark:!text-vault-300' : ''}
            >
              <Pencil className="h-4 w-4" />
            </IconButton>
            <IconButton label="Cerrar" onClick={onClose}><X className="h-4 w-4" /></IconButton>
          </div>
        </div>

        <div className="space-y-4">
          <div className="detail-row">
            <div className="detail-label"><Globe /> Sitio web</div>
            {editing ? (
              <input
                type="text"
                value={site}
                onChange={(event) => setSite(event.target.value)}
                placeholder="https://ejemplo.com"
                className="input-field"
              />
            ) : (
              <p className="type-body truncate text-slate-800 dark:text-slate-200">{entry.site}</p>
            )}
          </div>

          <div className="detail-row">
            <div className="detail-label"><User /> Usuario</div>
            {editing ? (
              <input value={username} onChange={(event) => setUsername(event.target.value)} className="input-field" />
            ) : (
              <div className="flex items-center justify-between gap-2">
                <p className="type-body truncate text-slate-800 dark:text-slate-200">{entry.username}</p>
                <IconButton label="Copiar usuario" onClick={() => onCopy(entry.username, 'Usuario')}>
                  <Copy className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            )}
          </div>

          <div className="detail-row">
            <div className="detail-label"><KeyRound /> Contraseña</div>
            {editing ? (
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="input-field"
              />
            ) : (
              <div className="flex items-center justify-between gap-2">
                <p className="type-body truncate tracking-wider text-slate-800 dark:text-slate-200">
                  {showPassword ? entry.password : '••••••••••••'}
                </p>
                <div className="flex items-center">
                  <IconButton
                    label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </IconButton>
                  <IconButton label="Copiar contraseña" onClick={() => onCopy(entry.password, 'Contraseña')}>
                    <Copy className="h-3.5 w-3.5" />
                  </IconButton>
                </div>
              </div>
            )}
          </div>

          <div className="detail-row">
            <div className="detail-label"><FileText /> Notas</div>
            {editing ? (
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="input-field resize-none" rows={2} />
            ) : (
              <p className="type-body whitespace-pre-wrap text-slate-600 dark:text-slate-400">{entry.notes || 'Sin notas'}</p>
            )}
          </div>

          <div className="detail-row">
            <div className="detail-label"><CalendarDays /> Renovación</div>
            {editing ? (
              <div className="grid grid-cols-[1fr_100px] gap-2">
                <input
                  type="date"
                  value={passwordChangedOn}
                  onChange={(event) => setPasswordChangedOn(event.target.value)}
                  className="input-field"
                  aria-label="Fecha del último cambio"
                />
                <label className="relative">
                  <RefreshCw className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={renewalIntervalMonths}
                    onChange={(event) => setRenewalIntervalMonths(Math.max(1, Math.min(24, Number(event.target.value))))}
                    className="input-field pl-9 pr-2"
                    aria-label="Meses entre renovaciones"
                  />
                </label>
              </div>
            ) : renewal.status === 'unconfigured' ? (
              <p className="type-body font-medium text-amber-600 dark:text-amber-400">Configurar fecha del último cambio</p>
            ) : (
              <div className="type-body flex items-center justify-between gap-2">
                <span className="text-slate-700 dark:text-slate-300">Cada {entry.renewalIntervalMonths || DEFAULT_RENEWAL_MONTHS} meses</span>
                <span className={renewal.status === 'overdue' ? 'font-semibold text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}>
                  {new Date(`${renewal.dueOn}T00:00:00`).toLocaleDateString('es-PE')}
                </span>
              </div>
            )}
          </div>

          <div className="type-secondary flex items-center gap-1.5 pt-1 text-slate-400 dark:text-slate-500">
            <Clock className="h-3 w-3" />
            <span>Creado el {new Date(entry.createdAt).toLocaleDateString('es-PE')}</span>
          </div>
        </div>

        {editing && confirmRenewal ? (
          <div className="mt-5 rounded-xl border border-vault-200 bg-vault-50 p-3 dark:border-vault-800 dark:bg-vault-950/30">
            <p className="type-body font-semibold text-vault-800 dark:text-vault-200">¿La contraseña fue renovada?</p>
            <p className="type-secondary mt-1 text-vault-700/80 dark:text-vault-300">Esto define desde cuándo se calculará el próximo vencimiento.</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => void saveChanges(passwordChangedOn)} disabled={busy} className="btn-ghost flex-1">No, solo corregí</button>
              <button onClick={() => void saveChanges(toLocalDateString())} disabled={busy} className="btn-primary flex-1">Sí, se renovó</button>
            </div>
          </div>
        ) : editing ? (
          <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
            <button onClick={() => setEditing(false)} className="btn-ghost flex-1">Cancelar</button>
            <button
              onClick={handleSave}
              disabled={busy || !site.trim() || !username.trim() || !password}
              className="btn-primary flex flex-1 items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" /> {busy ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        ) : (
          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700">
            {confirmDelete ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
                <p className="type-body flex items-center gap-2 font-semibold text-red-700 dark:text-red-300">
                  <AlertTriangle className="h-4 w-4" /> ¿Eliminar este acceso?
                </p>
                <p className="type-secondary mt-1 text-red-600/80 dark:text-red-400">Esta acción no se puede deshacer.</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setConfirmDelete(false)} className="btn-ghost flex-1">Cancelar</button>
                  <button onClick={handleDelete} disabled={busy} className="btn-danger flex-1">
                    {busy ? 'Eliminando…' : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="btn-danger flex items-center gap-2">
                <Trash2 className="h-4 w-4" /> Eliminar acceso
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

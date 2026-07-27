import { useState } from 'react'
import {
  X, Eye, EyeOff, Copy, Pencil, Trash2, Globe, User,
  KeyRound, FileText, Clock, Save, AlertTriangle,
} from 'lucide-react'
import type { PasswordEntry } from '../types'
import { getHostname } from '../../shared/site'
import { IconButton } from './IconButton'

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
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const domain = getHostname(site)

  const handleSave = async () => {
    if (!site.trim() || !username.trim() || !password) return
    setBusy(true)
    try {
      const updated = await onUpdate(entry.id, {
        site: site.trim(),
        username: username.trim(),
        password,
        notes: notes.trim(),
      })
      if (updated) setEditing(false)
    } finally {
      setBusy(false)
    }
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
            <p className="text-xs font-semibold text-vault-600 dark:text-vault-300">DETALLE DEL ACCESO</p>
            <h2 id="detail-title" className="mt-1 truncate text-lg font-bold text-slate-900 dark:text-slate-100">{domain}</h2>
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
              <p className="truncate text-sm text-slate-800 dark:text-slate-200">{entry.site}</p>
            )}
          </div>

          <div className="detail-row">
            <div className="detail-label"><User /> Usuario</div>
            {editing ? (
              <input value={username} onChange={(event) => setUsername(event.target.value)} className="input-field" />
            ) : (
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm text-slate-800 dark:text-slate-200">{entry.username}</p>
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
                <p className="truncate font-mono text-sm tracking-wider text-slate-800 dark:text-slate-200">
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
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">{entry.notes || 'Sin notas'}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-400 dark:text-slate-500">
            <Clock className="h-3 w-3" />
            <span>Creado el {new Date(entry.createdAt).toLocaleDateString('es-PE')}</span>
          </div>
        </div>

        {editing ? (
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
                <p className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300">
                  <AlertTriangle className="h-4 w-4" /> ¿Eliminar este acceso?
                </p>
                <p className="mt-1 text-xs text-red-600/80 dark:text-red-400">Esta acción no se puede deshacer.</p>
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

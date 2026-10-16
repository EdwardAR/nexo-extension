import { useRef, useState, type ChangeEvent } from 'react'
import { AlertTriangle, DatabaseBackup, Download, FileJson, Upload, X } from 'lucide-react'
import { IconButton } from './IconButton'

interface DataManagementModalProps {
  onClose: () => void
  onExport: () => Promise<boolean>
  onImport: (backup: unknown) => Promise<boolean>
}

export function DataManagementModal({
  onClose,
  onExport,
  onImport,
}: DataManagementModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [confirmImport, setConfirmImport] = useState(false)
  const [pendingBackup, setPendingBackup] = useState<unknown>(null)
  const [busy, setBusy] = useState(false)
  const [fileName, setFileName] = useState('')

  const selectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      setPendingBackup(JSON.parse(await file.text()))
      setFileName(file.name)
      setConfirmImport(true)
    } catch {
      setPendingBackup(null)
      setFileName('')
      await onImport(null)
    }
  }

  const exportData = async () => {
    setBusy(true)
    try {
      await onExport()
    } finally {
      setBusy(false)
    }
  }

  const importData = async () => {
    setBusy(true)
    try {
      if (await onImport(pendingBackup)) onClose()
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
        aria-labelledby="data-title"
      >
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-vault-50 text-vault-600 dark:bg-vault-950/60 dark:text-vault-300">
              <DatabaseBackup className="h-5 w-5" />
            </span>
            <div>
              <h2 id="data-title" className="type-section text-slate-900 dark:text-slate-100">Importar y exportar</h2>
              <p className="type-secondary mt-0.5 text-slate-500 dark:text-slate-400">Crea o restaura un respaldo cifrado.</p>
            </div>
          </div>
          <IconButton label="Cerrar" onClick={onClose}><X className="h-4 w-4" /></IconButton>
        </div>

        {confirmImport ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <p className="type-body flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" /> ¿Restaurar este respaldo?
            </p>
            <p className="type-secondary mt-2 break-all font-medium text-amber-700 dark:text-amber-400">{fileName}</p>
            <p className="type-secondary mt-2 text-amber-700/80 dark:text-amber-400">
              La bóveda actual será reemplazada. Necesitarás la contraseña maestra con la que se creó el respaldo.
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setConfirmImport(false)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={importData} disabled={busy} className="btn-primary flex-1">
                {busy ? 'Restaurando…' : 'Restaurar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={exportData}
              disabled={busy}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-vault-300 hover:bg-vault-50/50 dark:border-slate-700 dark:hover:border-vault-700 dark:hover:bg-vault-950/20"
            >
              <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <Download className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <strong className="type-section block text-slate-900 dark:text-slate-100">Exportar respaldo</strong>
                <small className="type-secondary mt-1 block text-slate-500 dark:text-slate-400">Descarga todas tus credenciales cifradas.</small>
              </span>
              <FileJson className="h-4 w-4 text-slate-400" />
            </button>

            <button
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-vault-300 hover:bg-vault-50/50 dark:border-slate-700 dark:hover:border-vault-700 dark:hover:bg-vault-950/20"
            >
              <span className="rounded-lg bg-vault-50 p-2 text-vault-600 dark:bg-vault-950/50 dark:text-vault-300">
                <Upload className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <strong className="type-section block text-slate-900 dark:text-slate-100">Importar respaldo</strong>
                <small className="type-secondary mt-1 block text-slate-500 dark:text-slate-400">Restaura un archivo compatible de Nexo o PassSave.</small>
              </span>
              <FileJson className="h-4 w-4 text-slate-400" />
            </button>

            <input ref={inputRef} type="file" accept="application/json,.json" onChange={selectFile} className="hidden" />
          </div>
        )}

        <p className="type-secondary mt-4 text-center text-slate-400">
          El respaldo no contiene contraseñas en texto plano.
        </p>
      </div>
    </div>
  )
}

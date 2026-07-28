import { useState, useCallback, useEffect, useRef } from 'react'
import type { PasswordDraft, PasswordEntry } from './types'
import { useVault } from './hooks/useVault'
import { useTheme } from './hooks/useTheme'
import { useToast } from './hooks/useToast'
import { LockScreen } from './components/LockScreen'
import { Dashboard } from './components/Dashboard'
import { AddPasswordModal } from './components/AddPasswordModal'
import { ViewPasswordModal } from './components/ViewPasswordModal'
import { ToastContainer } from './components/Toast'
import { ThemeToggle } from './components/ThemeToggle'
import { DataManagementModal } from './components/DataManagementModal'
import { createBackup, restoreBackup } from './lib/backup'
import { RenewalPanel } from './components/RenewalPanel'

export default function App() {
  const {
    unlocked, entries, draft, loading, unlock, lock,
    addEntry, updateEntry, deleteEntry, saveDraft, discardDraft,
  } = useVault()
  const { dark, toggle } = useTheme()
  const { toasts, addToast, removeToast } = useToast()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showDataModal, setShowDataModal] = useState(false)
  const [showRenewalPanel, setShowRenewalPanel] = useState(false)
  const [viewingEntry, setViewingEntry] = useState<PasswordEntry | null>(null)
  const draftOpenedRef = useRef(false)

  useEffect(() => {
    if (unlocked && draft && !draftOpenedRef.current) {
      draftOpenedRef.current = true
      setShowAddModal(true)
    }
    if (!draft) draftOpenedRef.current = false
  }, [unlocked, draft])

  const handleUnlock = useCallback(
    async (password: string) => {
      const success = await unlock(password)
      if (success) {
        addToast('Bóveda desbloqueada', 'success')
      }
      return success
    },
    [unlock, addToast]
  )

  const handleLock = useCallback(async () => {
    await lock()
    addToast('Bóveda bloqueada', 'info')
  }, [lock, addToast])

  const handleAdd = useCallback(
    async (entry: PasswordEntry) => {
      try {
        await addEntry(entry)
        addToast('Contraseña guardada', 'success')
        return true
      } catch {
        addToast('No se pudo guardar la contraseña', 'error')
        return false
      }
    },
    [addEntry, addToast]
  )

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<PasswordEntry>) => {
      try {
        await updateEntry(id, updates)
        setViewingEntry((current) =>
          current?.id === id ? { ...current, ...updates, updatedAt: Date.now() } : current
        )
        addToast('Cambios guardados', 'success')
        return true
      } catch {
        addToast('No se pudieron guardar los cambios', 'error')
        return false
      }
    },
    [updateEntry, addToast]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteEntry(id)
        setViewingEntry(null)
        addToast('Contraseña eliminada', 'success')
        return true
      } catch {
        addToast('No se pudo eliminar la contraseña', 'error')
        return false
      }
    },
    [deleteEntry, addToast]
  )

  const handleCopy = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text)
        addToast(`${label} copiado`, 'success')
      } catch {
        addToast('No se pudo copiar', 'error')
      }
    },
    [addToast]
  )

  const handleDraftChange = useCallback(async (nextDraft: PasswordDraft) => {
    try {
      await saveDraft(nextDraft)
    } catch {
      addToast('No se pudo conservar el borrador', 'error')
    }
  }, [saveDraft, addToast])

  const handleDiscardDraft = useCallback(async () => {
    await discardDraft()
    addToast('Borrador descartado', 'info')
  }, [discardDraft, addToast])

  const handleExport = useCallback(async () => {
    try {
      const backup = await createBackup()
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `passsave-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 0)
      addToast('Respaldo exportado', 'success')
      return true
    } catch {
      addToast('No se pudo exportar el respaldo', 'error')
      return false
    }
  }, [addToast])

  const handleImport = useCallback(
    async (backup: unknown) => {
      try {
        await restoreBackup(backup)
        await lock()
        addToast('Respaldo restaurado. Desbloquéalo con su contraseña maestra.', 'success')
        return true
      } catch {
        addToast('El archivo no es un respaldo compatible', 'error')
        return false
      }
    },
    [lock, addToast]
  )

  if (!unlocked) {
    return (
      <>
        <div className="absolute top-3 right-3">
          <ThemeToggle dark={dark} onToggle={toggle} />
        </div>
        <LockScreen onUnlock={handleUnlock} loading={loading} />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  return (
    <>
      <Dashboard
        entries={entries}
        onAdd={() => setShowAddModal(true)}
        onView={setViewingEntry}
        onCopy={handleCopy}
        onLock={handleLock}
        onOpenData={() => setShowDataModal(true)}
        onOpenRenewals={() => setShowRenewalPanel(true)}
        dark={dark}
        onToggleTheme={toggle}
      />

      {showAddModal && (
        <AddPasswordModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          onDraftChange={handleDraftChange}
          onDiscard={handleDiscardDraft}
          initialDraft={draft}
        />
      )}

      {viewingEntry && (
        <ViewPasswordModal
          entry={viewingEntry}
          onClose={() => setViewingEntry(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onCopy={handleCopy}
        />
      )}

      {showDataModal && (
        <DataManagementModal
          onClose={() => setShowDataModal(false)}
          onExport={handleExport}
          onImport={handleImport}
        />
      )}

      {showRenewalPanel && (
        <RenewalPanel
          entries={entries}
          onClose={() => setShowRenewalPanel(false)}
          onView={setViewingEntry}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}

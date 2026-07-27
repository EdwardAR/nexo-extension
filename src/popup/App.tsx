import { useState, useCallback } from 'react'
import type { PasswordEntry } from './types'
import { useVault } from './hooks/useVault'
import { useTheme } from './hooks/useTheme'
import { useToast } from './hooks/useToast'
import { LockScreen } from './components/LockScreen'
import { Dashboard } from './components/Dashboard'
import { AddPasswordModal } from './components/AddPasswordModal'
import { ViewPasswordModal } from './components/ViewPasswordModal'
import { ToastContainer } from './components/Toast'
import { ThemeToggle } from './components/ThemeToggle'

export default function App() {
  const { unlocked, entries, loading, unlock, lock, addEntry, updateEntry, deleteEntry } = useVault()
  const { dark, toggle } = useTheme()
  const { toasts, addToast, removeToast } = useToast()

  const [showAddModal, setShowAddModal] = useState(false)
  const [viewingEntry, setViewingEntry] = useState<PasswordEntry | null>(null)

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
        dark={dark}
        onToggleTheme={toggle}
      />

      {showAddModal && (
        <AddPasswordModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
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

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}

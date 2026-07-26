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
        addToast('Vault unlocked', 'success')
      }
      return success
    },
    [unlock, addToast]
  )

  const handleLock = useCallback(async () => {
    await lock()
    addToast('Vault locked', 'info')
  }, [lock, addToast])

  const handleAdd = useCallback(
    async (entry: PasswordEntry) => {
      await addEntry(entry)
      addToast('Password saved', 'success')
    },
    [addEntry, addToast]
  )

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<PasswordEntry>) => {
      await updateEntry(id, updates)
    },
    [updateEntry]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteEntry(id)
    },
    [deleteEntry]
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
        onDelete={handleDelete}
        onLock={handleLock}
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
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}

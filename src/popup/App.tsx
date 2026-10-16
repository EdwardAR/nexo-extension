import { lazy, Suspense, useState, useCallback, useEffect, useRef } from 'react'
import type { PasswordDraft, PasswordEntry } from './types'
import { useVault } from './hooks/useVault'
import { useTheme } from './hooks/useTheme'
import { useToast } from './hooks/useToast'
import { LockScreen } from './components/LockScreen'
import { ToastContainer } from './components/Toast'
import { ThemeToggle } from './components/ThemeToggle'
import { useOnboarding } from './hooks/useOnboarding'
import { useProfile } from './hooks/useProfile'

const Dashboard = lazy(() => import('./components/Dashboard').then(({ Dashboard }) => ({ default: Dashboard })))
const AddPasswordModal = lazy(() => import('./components/AddPasswordModal').then(({ AddPasswordModal }) => ({ default: AddPasswordModal })))
const ViewPasswordModal = lazy(() => import('./components/ViewPasswordModal').then(({ ViewPasswordModal }) => ({ default: ViewPasswordModal })))
const DataManagementModal = lazy(() => import('./components/DataManagementModal').then(({ DataManagementModal }) => ({ default: DataManagementModal })))
const RenewalPanel = lazy(() => import('./components/RenewalPanel').then(({ RenewalPanel }) => ({ default: RenewalPanel })))
const OnboardingSlides = lazy(() => import('./components/OnboardingSlides').then(({ OnboardingSlides }) => ({ default: OnboardingSlides })))
const TimePanel = lazy(() => import('./components/TimePanel').then(({ TimePanel }) => ({ default: TimePanel })))
const PasswordsPanel = lazy(() => import('./components/PasswordsPanel').then(({ PasswordsPanel }) => ({ default: PasswordsPanel })))
const ProfileModal = lazy(() => import('./components/ProfileModal').then(({ ProfileModal }) => ({ default: ProfileModal })))

function LoadingScreen() {
  return (
    <main className="type-body flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 font-medium text-slate-500 dark:bg-slate-950 dark:text-slate-400">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-vault-500 border-t-transparent" aria-hidden="true" />
      <span role="status">Abriendo Nexo…</span>
    </main>
  )
}

async function getActivePageUrl() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    if (!tab?.url) return ''

    const url = new URL(tab.url)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''

    url.search = ''
    url.hash = ''
    return url.toString()
  } catch {
    return ''
  }
}

export default function App() {
  const {
    unlocked, entries, draft, loading, unlock, lock,
    addEntry, updateEntry, deleteEntry, saveDraft, discardDraft,
  } = useVault()
  const { profileName, updateProfileName } = useProfile()
  const { dark, toggle } = useTheme()
  const { toasts, addToast, removeToast } = useToast()
  const { showOnboarding, completeOnboarding } = useOnboarding()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showDataModal, setShowDataModal] = useState(false)
  const [showRenewalPanel, setShowRenewalPanel] = useState(false)
  const [showTimePanel, setShowTimePanel] = useState(false)
  const [showPasswordsPanel, setShowPasswordsPanel] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [addInitialSite, setAddInitialSite] = useState('')
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
    async (password: string, username: string) => {
      const success = await unlock(password)
      if (success) {
        try {
          await updateProfileName(username)
        } catch {
          addToast('No se pudo guardar el nombre de usuario', 'error')
        }
        addToast('Bóveda desbloqueada', 'success')
      }
      return success
    },
    [unlock, updateProfileName, addToast]
  )

  const handleProfileSave = useCallback(async (name: string) => {
    try {
      await updateProfileName(name)
      addToast('Nombre de usuario actualizado', 'success')
      return true
    } catch {
      addToast('No se pudo guardar el nombre de usuario', 'error')
      return false
    }
  }, [updateProfileName, addToast])

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

  const openAddModal = useCallback(async () => {
    setAddInitialSite(await getActivePageUrl())
    setShowAddModal(true)
  }, [])

  const closeAddModal = useCallback(() => {
    setShowAddModal(false)
    setAddInitialSite('')
  }, [])

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
      const { createBackup } = await import('./lib/backup')
      const backup = await createBackup()
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `nexo-backup-${new Date().toISOString().slice(0, 10)}.json`
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
        const { restoreBackup } = await import('./lib/backup')
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

  if (showOnboarding === null) return <LoadingScreen />

  if (showOnboarding) {
    return (
      <>
        <div className="absolute top-3 right-3 z-10">
          <ThemeToggle dark={dark} onToggle={toggle} />
        </div>
        <Suspense fallback={<LoadingScreen />}>
          <OnboardingSlides onFinish={completeOnboarding} />
        </Suspense>
      </>
    )
  }

  if (!unlocked) {
    return (
      <>
        <div className="absolute top-3 right-3">
          <ThemeToggle dark={dark} onToggle={toggle} />
        </div>
        <LockScreen onUnlock={handleUnlock} loading={loading} savedUsername={profileName} />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  if (showTimePanel) {
    return (
      <>
        <Suspense fallback={<LoadingScreen />}>
          <TimePanel
            onClose={() => setShowTimePanel(false)}
            onToast={addToast}
          />
        </Suspense>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  if (showPasswordsPanel) {
    return (
      <>
        <Suspense fallback={<LoadingScreen />}>
          <PasswordsPanel
            entries={entries}
            onClose={() => setShowPasswordsPanel(false)}
            onAdd={() => void openAddModal()}
            onView={setViewingEntry}
            onCopy={handleCopy}
          />
        </Suspense>

        <Suspense fallback={null}>
          {showAddModal && (
            <AddPasswordModal
              onClose={closeAddModal}
              onSave={handleAdd}
              onDraftChange={handleDraftChange}
              onDiscard={handleDiscardDraft}
              initialDraft={draft}
              initialSite={addInitialSite}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {viewingEntry && (
            <ViewPasswordModal
              entry={viewingEntry}
              onClose={() => setViewingEntry(null)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onCopy={handleCopy}
            />
          )}
        </Suspense>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Dashboard
          entries={entries}
          onLock={handleLock}
          onOpenData={() => setShowDataModal(true)}
          onOpenRenewals={() => setShowRenewalPanel(true)}
          onOpenTime={() => setShowTimePanel(true)}
          onOpenPasswords={() => setShowPasswordsPanel(true)}
          profileName={profileName}
          onOpenProfile={() => setShowProfileModal(true)}
          dark={dark}
          onToggleTheme={toggle}
        />
      </Suspense>

      <Suspense fallback={null}>
        {showAddModal && (
          <AddPasswordModal
            onClose={closeAddModal}
            onSave={handleAdd}
            onDraftChange={handleDraftChange}
            onDiscard={handleDiscardDraft}
            initialDraft={draft}
            initialSite={addInitialSite}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {viewingEntry && (
          <ViewPasswordModal
            entry={viewingEntry}
            onClose={() => setViewingEntry(null)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onCopy={handleCopy}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {showProfileModal && (
          <ProfileModal
            name={profileName}
            onClose={() => setShowProfileModal(false)}
            onSave={handleProfileSave}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {showDataModal && (
          <DataManagementModal
            onClose={() => setShowDataModal(false)}
            onExport={handleExport}
            onImport={handleImport}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {showRenewalPanel && (
          <RenewalPanel
            entries={entries}
            onClose={() => setShowRenewalPanel(false)}
            onView={setViewingEntry}
          />
        )}
      </Suspense>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}

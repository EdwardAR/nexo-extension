import { useCallback, useEffect, useRef, useState } from 'react'
import type { PasswordDraft, PasswordEntry } from '../types'
import * as storage from '../lib/storage'
import {
  clearVaultSession,
  getVaultSession,
  startVaultSession,
} from '../../shared/vault-session'

export function useVault() {
  const [unlocked, setUnlocked] = useState(false)
  const [entries, setEntries] = useState<PasswordEntry[]>([])
  const [draft, setDraft] = useState<PasswordDraft | null>(null)
  const [loading, setLoading] = useState(false)
  const entriesRef = useRef<PasswordEntry[]>([])
  const restoreSessionRef = useRef<Promise<storage.LoadedVaultData | null> | null>(null)
  const entryWriteQueueRef = useRef<Promise<void>>(Promise.resolve())
  const draftWriteQueueRef = useRef<Promise<void>>(Promise.resolve())

  const replaceEntries = useCallback((nextEntries: PasswordEntry[]) => {
    entriesRef.current = nextEntries
    setEntries(nextEntries)
  }, [])

  const clearMemory = useCallback(() => {
    setUnlocked(false)
    replaceEntries([])
    setDraft(null)
  }, [replaceEntries])

  const restoreSession = useCallback(async (): Promise<storage.LoadedVaultData | null> => {
    const session = await getVaultSession()
    if (!session) return null

    const snapshot = await storage.readVaultSnapshot()
    return storage.loadVaultSnapshot(snapshot, session.password)
  }, [])

  useEffect(() => {
    let mounted = true
    restoreSessionRef.current ??= restoreSession()

    restoreSessionRef.current
      .then((data) => {
        if (!mounted || !data) return
        replaceEntries(data.entries)
        setDraft(data.draft)
        setUnlocked(true)
      })
      .catch(() => {
        void clearVaultSession()
        if (mounted) clearMemory()
      })

    return () => {
      mounted = false
    }
  }, [clearMemory, replaceEntries, restoreSession])

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    setLoading(true)
    try {
      const snapshot = await storage.readVaultSnapshot()
      const validPassword = await storage.verifyOrSetMasterPassword(password, snapshot)
      if (!validPassword) return false

      const data = await storage.loadVaultSnapshot(snapshot, password)
      await startVaultSession(password)
      replaceEntries(data.entries)
      setDraft(data.draft)
      setUnlocked(true)
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }, [replaceEntries])

  const lock = useCallback(async () => {
    await clearVaultSession()
    clearMemory()
  }, [clearMemory])

  const getPassword = useCallback(async () => {
    const session = await getVaultSession()
    if (session?.password) return session.password
    clearMemory()
    throw new Error('Vault session expired')
  }, [clearMemory])

  const persistEntries = useCallback(async (
    createNextEntries: (currentEntries: PasswordEntry[]) => PasswordEntry[]
  ) => {
    const write = entryWriteQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        const nextEntries = createNextEntries(entriesRef.current)
        await storage.persistVault(nextEntries, await getPassword())
        replaceEntries(nextEntries)
      })

    entryWriteQueueRef.current = write
    await write
  }, [getPassword, replaceEntries])

  const addEntry = useCallback(async (entry: PasswordEntry) => {
    await persistEntries((currentEntries) => [...currentEntries, entry])
    const clearDraft = draftWriteQueueRef.current
      .catch(() => undefined)
      .then(storage.clearDraft)
      .then(() => setDraft(null))
    draftWriteQueueRef.current = clearDraft
    await clearDraft
  }, [persistEntries])

  const updateEntry = useCallback(async (id: string, updates: Partial<PasswordEntry>) => {
    await persistEntries((currentEntries) => {
      if (!currentEntries.some((entry) => entry.id === id)) {
        throw new Error('Entry not found')
      }
      return currentEntries.map((entry) =>
        entry.id === id ? { ...entry, ...updates, updatedAt: Date.now() } : entry
      )
    })
  }, [persistEntries])

  const deleteEntry = useCallback(async (id: string) => {
    await persistEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== id))
  }, [persistEntries])

  const saveDraft = useCallback(async (nextDraft: PasswordDraft) => {
    const write = draftWriteQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        await storage.saveDraft(nextDraft, await getPassword())
        setDraft(nextDraft)
      })
    draftWriteQueueRef.current = write
    await write
  }, [getPassword])

  const discardDraft = useCallback(async () => {
    const clearDraft = draftWriteQueueRef.current
      .catch(() => undefined)
      .then(storage.clearDraft)
      .then(() => setDraft(null))
    draftWriteQueueRef.current = clearDraft
    await clearDraft
  }, [])

  return {
    unlocked,
    entries,
    draft,
    loading,
    unlock,
    lock,
    addEntry,
    updateEntry,
    deleteEntry,
    saveDraft,
    discardDraft,
  }
}

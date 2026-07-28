import { useCallback, useEffect, useState } from 'react'
import type { PasswordDraft, PasswordEntry } from '../types'
import * as storage from '../lib/storage'

export function useVault() {
  const [unlocked, setUnlocked] = useState(false)
  const [entries, setEntries] = useState<PasswordEntry[]>([])
  const [draft, setDraft] = useState<PasswordDraft | null>(null)
  const [loading, setLoading] = useState(false)

  const clearMemory = useCallback(() => {
    setUnlocked(false)
    setEntries([])
    setDraft(null)
  }, [])

  const loadData = useCallback(async (password: string) => {
    const data = await storage.loadVault(password)
    setEntries(data)
    setDraft(await storage.loadDraft(password))
    await storage.syncRenewalSchedule(data)
  }, [])

  useEffect(() => {
    const checkSessionStatus = async () => {
      try {
        const status = await chrome.runtime.sendMessage({ action: 'GET_SESSION_STATUS' })
        if (!status.sessionActive || !status.hasPassword) return

        const response = await chrome.runtime.sendMessage({ action: 'GET_PASSWORD' })
        if (!response.password) return clearMemory()
        await loadData(response.password)
        setUnlocked(true)
      } catch {
        clearMemory()
      }
    }

    const handleMessage = (request: { action?: string }) => {
      if (request.action === 'SESSION_LOCKED') clearMemory()
    }

    void checkSessionStatus()
    chrome.runtime.onMessage.addListener(handleMessage)
    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [clearMemory, loadData])

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    setLoading(true)
    try {
      const exists = await storage.isMasterPasswordSet()
      if (!exists) await storage.setMasterPassword(password)
      else if (!await storage.verifyMasterPassword(password)) return false

      await chrome.runtime.sendMessage({ action: 'UNLOCK_VAULT', password })
      await loadData(password)
      setUnlocked(true)
      return true
    } finally {
      setLoading(false)
    }
  }, [loadData])

  const lock = useCallback(async () => {
    await chrome.runtime.sendMessage({ action: 'LOCK_VAULT' })
    clearMemory()
  }, [clearMemory])

  const getPassword = useCallback(async () => {
    const response = await chrome.runtime.sendMessage({ action: 'GET_PASSWORD' })
    if (response.password) return response.password as string
    clearMemory()
    throw new Error('Vault session expired')
  }, [clearMemory])

  const addEntry = useCallback(async (entry: PasswordEntry) => {
    await storage.addEntry(entry, await getPassword())
    await storage.clearDraft()
    setEntries((current) => [...current, entry])
    setDraft(null)
  }, [getPassword])

  const updateEntry = useCallback(async (id: string, updates: Partial<PasswordEntry>) => {
    await storage.updateEntry(id, updates, await getPassword())
    setEntries((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, ...updates, updatedAt: Date.now() } : entry
      )
    )
  }, [getPassword])

  const deleteEntry = useCallback(async (id: string) => {
    await storage.deleteEntry(id, await getPassword())
    setEntries((current) => current.filter((entry) => entry.id !== id))
  }, [getPassword])

  const saveDraft = useCallback(async (nextDraft: PasswordDraft) => {
    await storage.saveDraft(nextDraft, await getPassword())
    setDraft(nextDraft)
  }, [getPassword])

  const discardDraft = useCallback(async () => {
    await storage.clearDraft()
    setDraft(null)
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

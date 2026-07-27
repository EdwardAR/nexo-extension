import { useState, useCallback, useEffect } from 'react'
import type { PasswordEntry } from '../types'
import * as storage from '../lib/storage'

export function useVault() {
  const [unlocked, setUnlocked] = useState(false)
  const [entries, setEntries] = useState<PasswordEntry[]>([])
  const [loading, setLoading] = useState(false)

  // Check session status on mount and listen for changes
  useEffect(() => {
    const checkSessionStatus = async () => {
      try {
        const status = await chrome.runtime.sendMessage({ action: 'GET_SESSION_STATUS' })
        if (status.sessionActive && status.hasPassword) {
          setUnlocked(true)
          // Load entries if already unlocked
          try {
            const response = await chrome.runtime.sendMessage({ action: 'GET_PASSWORD' })
            if (response.password) {
              const data = await storage.loadVault(response.password)
              setEntries(data)
            } else {
              setUnlocked(false)
              setEntries([])
            }
          } catch (error) {
            // Service worker may not have password anymore, lock the session
            setUnlocked(false)
            setEntries([])
          }
        }
      } catch (error) {
        console.error('Error checking session status:', error)
      }
    }

    checkSessionStatus()

    // Listen for session lock messages from service worker (autolock)
    const handleMessage = (request: any) => {
      if (request.action === 'SESSION_LOCKED') {
        setUnlocked(false)
        setEntries([])
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    setLoading(true)
    try {
      const exists = await storage.isMasterPasswordSet()
      if (!exists) {
        await storage.setMasterPassword(password)
        // Send password to service worker for session management
        await chrome.runtime.sendMessage({ action: 'UNLOCK_VAULT', password })
        setEntries([])
        setUnlocked(true)
        return true
      }

      const valid = await storage.verifyMasterPassword(password)
      if (!valid) return false

      // Send password to service worker for session management
      await chrome.runtime.sendMessage({ action: 'UNLOCK_VAULT', password })
      const data = await storage.loadVault(password)
      setEntries(data)
      setUnlocked(true)
      return true
    } finally {
      setLoading(false)
    }
  }, [])

  const lock = useCallback(async () => {
    await chrome.runtime.sendMessage({ action: 'LOCK_VAULT' })
    setUnlocked(false)
    setEntries([])
  }, [])

  const addEntry = useCallback(
    async (entry: PasswordEntry) => {
      const response = await chrome.runtime.sendMessage({ action: 'GET_PASSWORD' })
      if (!response.password) {
        setUnlocked(false)
        setEntries([])
        throw new Error('Vault session expired')
      }
      await storage.addEntry(entry, response.password)
      setEntries((prev) => [...prev, entry])
    },
    []
  )

  const updateEntry = useCallback(
    async (id: string, updates: Partial<PasswordEntry>) => {
      const response = await chrome.runtime.sendMessage({ action: 'GET_PASSWORD' })
      if (!response.password) {
        setUnlocked(false)
        setEntries([])
        throw new Error('Vault session expired')
      }
      await storage.updateEntry(id, updates, response.password)
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: Date.now() } : e
        )
      )
    },
    []
  )

  const deleteEntry = useCallback(
    async (id: string) => {
      const response = await chrome.runtime.sendMessage({ action: 'GET_PASSWORD' })
      if (!response.password) {
        setUnlocked(false)
        setEntries([])
        throw new Error('Vault session expired')
      }
      await storage.deleteEntry(id, response.password)
      setEntries((prev) => prev.filter((e) => e.id !== id))
    },
    []
  )

  return {
    unlocked,
    entries,
    loading,
    unlock,
    lock,
    addEntry,
    updateEntry,
    deleteEntry,
  }
}

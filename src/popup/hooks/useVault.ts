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
        const result = await chrome.storage.session.get('sessionActive')
        if (result.sessionActive) {
          setUnlocked(true)
          // Load entries if already unlocked
          try {
            const response = await chrome.runtime.sendMessage({ action: 'GET_PASSWORD' })
            if (response.password) {
              const data = await storage.loadVault(response.password)
              setEntries(data)
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
      try {
        const response = await chrome.runtime.sendMessage({ action: 'GET_PASSWORD' })
        if (!response.password) return
        await storage.addEntry(entry, response.password)
        setEntries((prev) => [...prev, entry])
      } catch (error) {
        console.error('Error adding entry:', error)
      }
    },
    []
  )

  const updateEntry = useCallback(
    async (id: string, updates: Partial<PasswordEntry>) => {
      try {
        const response = await chrome.runtime.sendMessage({ action: 'GET_PASSWORD' })
        if (!response.password) return
        await storage.updateEntry(id, updates, response.password)
        setEntries((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: Date.now() } : e
          )
        )
      } catch (error) {
        console.error('Error updating entry:', error)
      }
    },
    []
  )

  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        const response = await chrome.runtime.sendMessage({ action: 'GET_PASSWORD' })
        if (!response.password) return
        await storage.deleteEntry(id, response.password)
        setEntries((prev) => prev.filter((e) => e.id !== id))
      } catch (error) {
        console.error('Error deleting entry:', error)
      }
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

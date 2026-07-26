import { useState, useCallback, useRef } from 'react'
import type { PasswordEntry } from '../types'
import * as storage from '../lib/storage'

export function useVault() {
  const [unlocked, setUnlocked] = useState(false)
  const [entries, setEntries] = useState<PasswordEntry[]>([])
  const [loading, setLoading] = useState(false)
  const masterPasswordRef = useRef<string>('')

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    setLoading(true)
    try {
      const exists = await storage.isMasterPasswordSet()
      if (!exists) {
        await storage.setMasterPassword(password)
        masterPasswordRef.current = password
        setEntries([])
        setUnlocked(true)
        return true
      }

      const valid = await storage.verifyMasterPassword(password)
      if (!valid) return false

      masterPasswordRef.current = password
      const data = await storage.loadVault(password)
      setEntries(data)
      setUnlocked(true)
      return true
    } finally {
      setLoading(false)
    }
  }, [])

  const lock = useCallback(() => {
    setUnlocked(false)
    setEntries([])
    masterPasswordRef.current = ''
  }, [])

  const addEntry = useCallback(
    async (entry: PasswordEntry) => {
      const pw = masterPasswordRef.current
      if (!pw) return
      await storage.addEntry(entry, pw)
      setEntries((prev) => [...prev, entry])
    },
    []
  )

  const updateEntry = useCallback(
    async (id: string, updates: Partial<PasswordEntry>) => {
      const pw = masterPasswordRef.current
      if (!pw) return
      await storage.updateEntry(id, updates, pw)
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
      const pw = masterPasswordRef.current
      if (!pw) return
      await storage.deleteEntry(id, pw)
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

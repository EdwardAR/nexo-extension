import { useCallback, useEffect, useState } from 'react'
import {
  loadReminders,
  REMINDERS_KEY,
  type ScheduledReminder,
} from '../../shared/reminder'

export function useReminders() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setReminders((await loadReminders()).sort((a, b) => a.scheduledAt - b.scheduledAt))
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
    void chrome.runtime.sendMessage({ action: 'SYNC_REMINDER_ALARMS' }).catch(() => undefined)
    const handleChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName === 'local' && REMINDERS_KEY in changes) void refresh()
    }
    chrome.storage.onChanged.addListener(handleChange)
    return () => chrome.storage.onChanged.removeListener(handleChange)
  }, [refresh])

  const send = useCallback(async (message: Record<string, unknown>) => {
    const response = await chrome.runtime.sendMessage(message)
    if (!response?.success) throw new Error(response?.error || 'No se pudo guardar el recordatorio')
    await refresh()
    return response
  }, [refresh])

  return {
    reminders,
    loading,
    save: (reminder: ScheduledReminder) => send({ action: 'SAVE_REMINDER', reminder }),
    remove: (id: string) => send({ action: 'DELETE_REMINDER', id }),
    testNotification: () => send({ action: 'TEST_REMINDER_NOTIFICATION' }),
  }
}

import { useCallback, useEffect, useState } from 'react'
import {
  AUTOMATIONS_KEY,
  loadAutomations,
  type ClickAutomation,
} from '../../shared/automation'

export function useAutomations() {
  const [automations, setAutomations] = useState<ClickAutomation[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setAutomations(await loadAutomations())
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
    const handleChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName === 'local' && AUTOMATIONS_KEY in changes) void refresh()
    }
    chrome.storage.onChanged.addListener(handleChange)
    return () => chrome.storage.onChanged.removeListener(handleChange)
  }, [refresh])

  const send = useCallback(async (message: Record<string, unknown>) => {
    const response = await chrome.runtime.sendMessage(message)
    if (!response?.success) {
      if (response?.error === 'Unknown action') {
        throw new Error(
          'Edge está usando un proceso antiguo. Abre edge://extensions, pulsa Recargar en PassSave y vuelve a intentarlo.'
        )
      }
      throw new Error(response?.error || 'No se pudo completar la operación')
    }
    await refresh()
    return response
  }, [refresh])

  return {
    automations,
    loading,
    save: (automation: ClickAutomation) => send({
      action: 'SAVE_AUTOMATION',
      automation,
    }),
    remove: (id: string) => send({ action: 'DELETE_AUTOMATION', id }),
    record: (id: string) => send({ action: 'START_AUTOMATION_RECORDING', id }),
    run: (id: string) => send({ action: 'RUN_AUTOMATION', id }),
  }
}

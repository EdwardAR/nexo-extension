export const AUTOMATIONS_KEY = 'click_automations'
export const AUTOMATION_RECORDING_SESSION_KEY = 'click_automation_recording'
export const AUTOMATION_ALARM_PREFIX = 'click-automation:'

export interface AutomationStep {
  selector: string
  fallbackSelectors?: string[]
  pageUrl: string
  frameUrl?: string
  delayMs: number
  label: string
  disabledWhenRecorded?: boolean
}

export interface AutomationSchedule {
  enabled: boolean
  startAt: number
  endAt?: number
}

export type AutomationRunStatus = 'idle' | 'recording' | 'running' | 'completed' | 'failed'

export interface ClickAutomation {
  id: string
  name: string
  url: string
  steps: AutomationStep[]
  schedule?: AutomationSchedule
  createdAt: number
  updatedAt: number
  lastRunAt?: number
  lastStatus: AutomationRunStatus
  lastError?: string
}

export async function loadAutomations(): Promise<ClickAutomation[]> {
  const result = await chrome.storage.local.get(AUTOMATIONS_KEY)
  return Array.isArray(result[AUTOMATIONS_KEY])
    ? result[AUTOMATIONS_KEY] as ClickAutomation[]
    : []
}

export async function saveAutomations(automations: ClickAutomation[]) {
  await chrome.storage.local.set({ [AUTOMATIONS_KEY]: automations })
}

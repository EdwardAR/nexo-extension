import {
  loadVault,
  RENEWAL_SCHEDULE_KEY,
  type RenewalScheduleItem,
} from '../popup/lib/storage'
import { getHostname } from '../shared/site'
import { differenceInDays } from '../shared/renewal'
import {
  AUTOMATION_ALARM_PREFIX,
  AUTOMATION_RECORDING_SESSION_KEY,
  loadAutomations,
  saveAutomations,
  type AutomationStep,
  type ClickAutomation,
} from '../shared/automation'
import {
  loadReminders,
  REMINDER_ALARM_PREFIX,
  saveReminders,
  type ScheduledReminder,
} from '../shared/reminder'

const SESSION_KEY = 'vaultSession'
const RENEWAL_ALARM = 'checkRenewals'
const NOTIFICATION_ID = 'password-renewal-reminder'

interface VaultSession {
  active: boolean
  password: string
}

interface AutomationRecordingSession {
  automationId: string
  tabId: number
  lastClickAt: number
}

let recordingWriteQueue: Promise<unknown> = Promise.resolve()

async function getSession(): Promise<VaultSession | null> {
  const result = await chrome.storage.session.get(SESSION_KEY)
  return result[SESSION_KEY] ?? null
}

async function clearSession() {
  await chrome.storage.session.remove([SESSION_KEY, 'sessionActive'])
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Nexo installed')
  scheduleRenewalChecks()
  void restoreAutomationAlarms()
  void restoreReminderAlarms()
})

chrome.runtime.onStartup.addListener(() => {
  scheduleRenewalChecks()
  void restoreAutomationAlarms()
  void restoreReminderAlarms()
})

chrome.windows.onRemoved.addListener(async () => {
  const openWindows = await chrome.windows.getAll()
  if (openWindows.length === 0) await clearSession()
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.target === 'offscreen') return false

  const respond = async () => {
    switch (message.action) {
      case 'getAutofillData':
        return handleGetAutofillData(message.url)

      case 'saveDetectedCredentials':
        return handleSaveDetected()

      case 'UNLOCK_VAULT':
        await chrome.storage.session.set({
          [SESSION_KEY]: { active: true, password: message.password },
        })
        return { success: true }

      case 'LOCK_VAULT':
        await clearSession()
        return { success: true }

      case 'GET_SESSION_STATUS': {
        const session = await getSession()
        return {
          sessionActive: session?.active === true,
          hasPassword: Boolean(session?.password),
        }
      }

      case 'GET_PASSWORD': {
        const session = await getSession()
        if (!session?.active || !session.password) {
          return { error: 'Session not active' }
        }
        return { password: session.password }
      }

      case 'CHECK_RENEWALS':
        await checkRenewals()
        return { success: true }

      case 'SAVE_AUTOMATION':
        return saveAutomation(message.automation)

      case 'DELETE_AUTOMATION':
        return deleteAutomation(message.id)

      case 'START_AUTOMATION_RECORDING':
        return startAutomationRecording(message.id)

      case 'RECORD_AUTOMATION_CLICK':
        return queueRecordingClick(_sender, message.step)

      case 'FINISH_AUTOMATION_RECORDING':
        return queueFinishRecording(_sender.tab?.id)

      case 'GET_ACTIVE_RECORDING':
        return getActiveRecording(_sender.tab?.id)

      case 'RUN_AUTOMATION':
        void runAutomation(message.id, false)
        return { success: true }

      case 'SAVE_REMINDER':
        return saveReminder(message.reminder)

      case 'DELETE_REMINDER':
        return deleteReminder(message.id)

      default:
        return { error: 'Unknown action' }
    }
  }

  respond()
    .then(sendResponse)
    .catch((error) => sendResponse({ error: String(error) }))

  return true
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === RENEWAL_ALARM) void checkRenewals()
  if (alarm.name.startsWith(AUTOMATION_ALARM_PREFIX)) {
    void runAutomation(alarm.name.slice(AUTOMATION_ALARM_PREFIX.length), true)
  }
  if (alarm.name.startsWith(REMINDER_ALARM_PREFIX)) {
    void showReminder(alarm.name.slice(REMINDER_ALARM_PREFIX.length))
  }
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status !== 'complete') return
  void chrome.storage.session.get(AUTOMATION_RECORDING_SESSION_KEY).then(async (result) => {
    const session = result[AUTOMATION_RECORDING_SESSION_KEY] as AutomationRecordingSession | undefined
    if (session?.tabId === tabId) {
      const automation = (await loadAutomations()).find(
        (item) => item.id === session.automationId
      )
      void chrome.tabs.sendMessage(tabId, {
        action: 'START_CLICK_RECORDING',
        count: automation?.steps.length || 0,
      }).catch(() => undefined)
    }
  })
})

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === NOTIFICATION_ID || notificationId.startsWith('click-automation-result:') || notificationId.startsWith(REMINDER_ALARM_PREFIX)) {
    void chrome.action.openPopup().catch(() => undefined)
  }
})

function reminderAlarmName(id: string) {
  return `${REMINDER_ALARM_PREFIX}${id}`
}

async function syncReminderAlarm(reminder: ScheduledReminder) {
  await chrome.alarms.clear(reminderAlarmName(reminder.id))
  if (reminder.enabled && reminder.scheduledAt > Date.now()) {
    await chrome.alarms.create(reminderAlarmName(reminder.id), { when: reminder.scheduledAt })
  }
}

async function restoreReminderAlarms() {
  const reminders = await loadReminders()
  await Promise.all(reminders.map(syncReminderAlarm))
}

async function saveReminder(candidate: unknown) {
  if (!candidate || typeof candidate !== 'object') {
    return { success: false, error: 'El recordatorio no es válido' }
  }
  const value = candidate as Partial<ScheduledReminder>
  if (
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.message !== 'string' ||
    typeof value.scheduledAt !== 'number' ||
    typeof value.enabled !== 'boolean' ||
    typeof value.createdAt !== 'number' ||
    (value.timeZone !== undefined && value.timeZone !== 'America/Lima' && value.timeZone !== 'Europe/Madrid') ||
    !value.title.trim() ||
    !Number.isFinite(value.scheduledAt)
  ) return { success: false, error: 'El recordatorio no es válido' }

  const candidateReminder = value as ScheduledReminder
  const reminders = await loadReminders()
  const index = reminders.findIndex((item) => item.id === candidateReminder.id)
  const reminder: ScheduledReminder = {
    ...candidateReminder,
    title: candidateReminder.title.trim().slice(0, 60),
    message: candidateReminder.message.trim().slice(0, 160),
  }
  if (index === -1) reminders.push(reminder)
  else reminders[index] = reminder
  await saveReminders(reminders)
  await syncReminderAlarm(reminder)
  return { success: true }
}

async function deleteReminder(id: string) {
  const reminders = await loadReminders()
  await saveReminders(reminders.filter((item) => item.id !== id))
  await chrome.alarms.clear(reminderAlarmName(id))
  return { success: true }
}

async function showReminder(id: string) {
  const reminders = await loadReminders()
  const index = reminders.findIndex((item) => item.id === id)
  if (index === -1 || !reminders[index].enabled) return
  const reminder = reminders[index]
  await chrome.notifications.create(reminderAlarmName(id), {
    type: 'basic',
    iconUrl: 'public/icons/icon128.png',
    title: reminder.title,
    message: reminder.message || 'Tienes un recordatorio programado en Nexo.',
    contextMessage: reminder.timeZone === 'Europe/Madrid' ? 'Horario de España' : 'Horario de Perú',
    priority: 2,
  })
  reminders[index] = { ...reminder, enabled: false, notifiedAt: Date.now() }
  await saveReminders(reminders)
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && RENEWAL_SCHEDULE_KEY in changes) {
    void checkRenewals()
  }
})

async function handleGetAutofillData(url: string) {
  const session = await getSession()
  if (!session?.password) return { success: false, error: 'Vault locked' }

  const currentHostname = getHostname(url)
  const entries = await loadVault(session.password)
  const suggestions = entries
    .filter((entry) => getHostname(entry.site) === currentHostname)
    .map(({ site, username, password }) => ({ site, username, password }))

  return { success: true, suggestions }
}

async function handleSaveDetected() {
  const session = await getSession()
  if (!session?.password) {
    return { success: false, error: 'Vault locked - cannot save credentials' }
  }

  return { success: true }
}

function scheduleRenewalChecks() {
  chrome.alarms.create(RENEWAL_ALARM, {
    delayInMinutes: 1,
    periodInMinutes: 24 * 60,
  })
}

async function checkRenewals() {
  const result = await chrome.storage.local.get(RENEWAL_SCHEDULE_KEY)
  const schedule = Array.isArray(result[RENEWAL_SCHEDULE_KEY])
    ? result[RENEWAL_SCHEDULE_KEY] as RenewalScheduleItem[]
    : []

  let upcoming = 0
  let overdue = 0
  let changed = false

  const updated = schedule.map((item) => {
    const daysRemaining = differenceInDays(item.dueOn)
    if (daysRemaining <= 0 && item.dueNotifiedFor !== item.dueOn) {
      overdue += 1
      changed = true
      return { ...item, dueNotifiedFor: item.dueOn }
    }
    if (
      daysRemaining > 0 &&
      daysRemaining <= 7 &&
      item.advanceNotifiedFor !== item.dueOn
    ) {
      upcoming += 1
      changed = true
      return { ...item, advanceNotifiedFor: item.dueOn }
    }
    return item
  })

  if (changed) {
    await chrome.storage.local.set({ [RENEWAL_SCHEDULE_KEY]: updated })
  }

  const total = upcoming + overdue
  if (total === 0) return

  const message = overdue > 0 && upcoming > 0
    ? `${overdue} vencida${overdue === 1 ? '' : 's'} y ${upcoming} próxima${upcoming === 1 ? '' : 's'} a vencer.`
    : overdue > 0
      ? `${overdue} contraseña${overdue === 1 ? '' : 's'} requiere${overdue === 1 ? '' : 'n'} renovación.`
      : `${upcoming} contraseña${upcoming === 1 ? '' : 's'} vence${upcoming === 1 ? '' : 'n'} en los próximos 7 días.`

  await chrome.notifications.create(NOTIFICATION_ID, {
    type: 'basic',
    iconUrl: 'public/icons/icon128.png',
    title: 'Revisión de contraseñas',
    message,
    priority: 1,
  })
}

function alarmName(id: string) {
  return `${AUTOMATION_ALARM_PREFIX}${id}`
}

async function saveAutomation(candidate: ClickAutomation) {
  if (!candidate?.id || !candidate.name || !candidate.url) {
    return { success: false, error: 'Datos de automatización incompletos' }
  }
  const parsedUrl = new URL(candidate.url)
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return { success: false, error: 'La URL debe usar HTTP o HTTPS' }
  }

  const automations = await loadAutomations()
  const index = automations.findIndex((item) => item.id === candidate.id)
  const automation = { ...candidate, url: parsedUrl.href, updatedAt: Date.now() }
  if (index === -1) automations.push(automation)
  else automations[index] = automation
  await saveAutomations(automations)
  await syncAutomationAlarm(automation)
  return { success: true }
}

async function deleteAutomation(id: string) {
  const automations = await loadAutomations()
  await saveAutomations(automations.filter((item) => item.id !== id))
  await chrome.alarms.clear(alarmName(id))
  const result = await chrome.storage.session.get(AUTOMATION_RECORDING_SESSION_KEY)
  const session = result[AUTOMATION_RECORDING_SESSION_KEY] as AutomationRecordingSession | undefined
  if (session?.automationId === id) {
    await chrome.storage.session.remove(AUTOMATION_RECORDING_SESSION_KEY)
  }
  return { success: true }
}

async function syncAutomationAlarm(automation: ClickAutomation) {
  await chrome.alarms.clear(alarmName(automation.id))
  if (!automation.schedule?.enabled) return
  const when = Math.max(automation.schedule.startAt, Date.now() + 500)
  await chrome.alarms.create(alarmName(automation.id), { when })
}

async function restoreAutomationAlarms() {
  const automations = await loadAutomations()
  await Promise.all(automations.map(syncAutomationAlarm))
}

async function startAutomationRecording(id: string) {
  const automations = await loadAutomations()
  const index = automations.findIndex((item) => item.id === id)
  if (index === -1) return { success: false, error: 'Automatización no encontrada' }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) return { success: false, error: 'No hay una pestaña activa disponible' }

  automations[index] = {
    ...automations[index],
    steps: [],
    schedule: undefined,
    lastStatus: 'recording',
    lastError: undefined,
    updatedAt: Date.now(),
  }
  await saveAutomations(automations)
  await chrome.alarms.clear(alarmName(id))
  const session: AutomationRecordingSession = {
    automationId: id,
    tabId: tab.id,
    lastClickAt: Date.now(),
  }
  await chrome.storage.session.set({ [AUTOMATION_RECORDING_SESSION_KEY]: session })

  const targetUrl = automations[index].url
  if (samePage(tab.url, targetUrl)) {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'START_CLICK_RECORDING', count: 0 })
    } catch {
      await chrome.tabs.update(tab.id, { url: targetUrl, active: true })
    }
  } else {
    await chrome.tabs.update(tab.id, { url: targetUrl, active: true })
  }
  return { success: true }
}

async function recordAutomationClick(
  sender: chrome.runtime.MessageSender,
  step: Omit<AutomationStep, 'delayMs'>
) {
  const tabId = sender.tab?.id
  const result = await chrome.storage.session.get(AUTOMATION_RECORDING_SESSION_KEY)
  const session = result[AUTOMATION_RECORDING_SESSION_KEY] as AutomationRecordingSession | undefined
  if (!session || session.tabId !== tabId) return { success: false, error: 'No hay una grabación activa' }

  const automations = await loadAutomations()
  const index = automations.findIndex((item) => item.id === session.automationId)
  if (index === -1) return { success: false, error: 'Automatización no encontrada' }
  const now = Date.now()
  const delayMs = Math.min(15_000, Math.max(300, now - session.lastClickAt))
  const recordedStep: AutomationStep = {
    ...step,
    pageUrl: sender.tab?.url || step.pageUrl,
    frameUrl: sender.url || step.frameUrl || step.pageUrl,
    delayMs,
  }
  automations[index] = {
    ...automations[index],
    steps: [...automations[index].steps, recordedStep],
    updatedAt: now,
  }
  await saveAutomations(automations)
  await chrome.storage.session.set({
    [AUTOMATION_RECORDING_SESSION_KEY]: { ...session, lastClickAt: now },
  })
  const count = automations[index].steps.length
  if (tabId !== undefined) {
    void chrome.tabs.sendMessage(tabId, {
      action: 'UPDATE_RECORDING_COUNT',
      count,
      label: recordedStep.label,
      disabledWhenRecorded: recordedStep.disabledWhenRecorded,
    }, { frameId: 0 }).catch(() => undefined)
  }
  return { success: true, count }
}

function queueRecordingClick(
  sender: chrome.runtime.MessageSender,
  step: Omit<AutomationStep, 'delayMs'>
) {
  const operation = recordingWriteQueue.then(() => recordAutomationClick(sender, step))
  recordingWriteQueue = operation.catch(() => undefined)
  return operation
}

function queueFinishRecording(tabId: number | undefined) {
  const operation = recordingWriteQueue.then(() => finishAutomationRecording(tabId))
  recordingWriteQueue = operation.catch(() => undefined)
  return operation
}

async function finishAutomationRecording(tabId: number | undefined) {
  const result = await chrome.storage.session.get(AUTOMATION_RECORDING_SESSION_KEY)
  const session = result[AUTOMATION_RECORDING_SESSION_KEY] as AutomationRecordingSession | undefined
  if (!session || session.tabId !== tabId) return { success: false, error: 'No hay una grabación activa' }

  const automations = await loadAutomations()
  const index = automations.findIndex((item) => item.id === session.automationId)
  if (index !== -1) {
    automations[index] = {
      ...automations[index],
      lastStatus: 'idle',
      updatedAt: Date.now(),
    }
    await saveAutomations(automations)
  }
  await chrome.storage.session.remove(AUTOMATION_RECORDING_SESSION_KEY)
  await chrome.notifications.create(`click-automation-recorded:${session.automationId}`, {
    type: 'basic',
    iconUrl: 'public/icons/icon128.png',
    title: 'Grabación terminada',
    message: `${index === -1 ? 0 : automations[index].steps.length} clics guardados.`,
  })
  return { success: true }
}

async function getActiveRecording(tabId: number | undefined) {
  const result = await chrome.storage.session.get(AUTOMATION_RECORDING_SESSION_KEY)
  const session = result[AUTOMATION_RECORDING_SESSION_KEY] as AutomationRecordingSession | undefined
  if (!session || session.tabId !== tabId) return { active: false }
  const automation = (await loadAutomations()).find((item) => item.id === session.automationId)
  return { active: true, count: automation?.steps.length || 0 }
}

function samePage(first?: string, second?: string) {
  if (!first || !second) return false
  try {
    const a = new URL(first)
    const b = new URL(second)
    return a.origin === b.origin && a.pathname === b.pathname && a.search === b.search
  } catch {
    return false
  }
}

function sameFramePage(first?: string, second?: string) {
  if (!first || !second) return false
  try {
    const a = new URL(first)
    const b = new URL(second)
    return a.origin === b.origin && a.pathname === b.pathname
  } catch {
    return false
  }
}

async function getStepFrameId(
  tabId: number,
  step: AutomationStep,
  topPageUrl?: string
) {
  if (!step.frameUrl || sameFramePage(step.frameUrl, topPageUrl)) return 0
  const frames = await chrome.webNavigation.getAllFrames({ tabId }) || []
  const exact = frames.find((frame) => frame.url === step.frameUrl)
  if (exact) return exact.frameId
  const compatible = frames.find((frame) => sameFramePage(frame.url, step.frameUrl))
  if (compatible) return compatible.frameId
  throw new Error(`No se encontró el frame de “${step.label}”`)
}

async function waitForTab(tabId: number) {
  const current = await chrome.tabs.get(tabId)
  if (current.status === 'complete') return
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener)
      reject(new Error('La página tardó demasiado en cargar'))
    }, 30_000)
    const listener = (updatedId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (updatedId !== tabId || changeInfo.status !== 'complete') return
      clearTimeout(timeout)
      chrome.tabs.onUpdated.removeListener(listener)
      resolve()
    }
    chrome.tabs.onUpdated.addListener(listener)
  })
}

async function pause(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function executeAutomationStep(
  tabId: number,
  step: AutomationStep
) {
  let lastError = `No se encontró el control “${step.label}”`
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const tab = await chrome.tabs.get(tabId)
      const frameId = await getStepFrameId(tabId, step, tab.url)
      const acknowledgement = await chrome.tabs.sendMessage(tabId, {
        action: 'PLAY_AUTOMATION_STEP',
        selector: step.selector,
        fallbackSelectors: step.fallbackSelectors,
      }, { frameId })
      if (acknowledgement?.accepted) return
      lastError = acknowledgement?.error || lastError
      if (!acknowledgement?.retryable) throw new Error(lastError)
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
    await pause(250)
  }
  throw new Error(`${lastError} después de 15 segundos`)
}

async function setAutomationResult(id: string, updates: Partial<ClickAutomation>) {
  const automations = await loadAutomations()
  const index = automations.findIndex((item) => item.id === id)
  if (index === -1) return
  automations[index] = { ...automations[index], ...updates, updatedAt: Date.now() }
  await saveAutomations(automations)
}

async function runAutomation(id: string, scheduled: boolean) {
  const automation = (await loadAutomations()).find((item) => item.id === id)
  if (!automation) return
  if (!automation.steps.length) {
    await setAutomationResult(id, { lastStatus: 'failed', lastError: 'La grabación no tiene clics' })
    return
  }
  if (scheduled && automation.schedule?.endAt && Date.now() > automation.schedule.endAt) {
    await setAutomationResult(id, {
      lastStatus: 'failed',
      lastError: 'La franja horaria terminó antes de poder ejecutar',
      schedule: { ...automation.schedule, enabled: false },
    })
    return
  }

  await setAutomationResult(id, {
    lastStatus: 'running',
    lastRunAt: Date.now(),
    lastError: undefined,
  })

  try {
    const tabs = await chrome.tabs.query({})
    let tab = tabs.find((candidate) => samePage(candidate.url, automation.url))
    if (tab?.id) {
      tab = await chrome.tabs.update(tab.id, { active: true })
    } else {
      tab = await chrome.tabs.create({ url: automation.url, active: true })
    }
    if (!tab.id) throw new Error('No se pudo abrir la pestaña')
    await waitForTab(tab.id)

    for (const step of automation.steps) {
      await pause(step.delayMs)
      const current = await chrome.tabs.get(tab.id)
      if (!samePage(current.url, step.pageUrl)) {
        await chrome.tabs.update(tab.id, { url: step.pageUrl })
        await waitForTab(tab.id)
      } else if (current.status !== 'complete') {
        await waitForTab(tab.id)
      }
      await executeAutomationStep(tab.id, step)
    }

    await setAutomationResult(id, {
      lastStatus: 'completed',
      lastError: undefined,
      schedule: automation.schedule
        ? { ...automation.schedule, enabled: false }
        : undefined,
    })
    await notifyAutomationResult(automation, true)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await setAutomationResult(id, {
      lastStatus: 'failed',
      lastError: message,
      schedule: automation.schedule
        ? { ...automation.schedule, enabled: false }
        : undefined,
    })
    await notifyAutomationResult(automation, false, message)
  } finally {
    await chrome.alarms.clear(alarmName(id))
  }
}

async function ensureOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL('automation-sound.html')
  if ('getContexts' in chrome.runtime) {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
      documentUrls: [offscreenUrl],
    })
    if (contexts.length > 0) return
  } else {
    const serviceWorker = self as unknown as {
      clients: { matchAll: () => Promise<Array<{ url: string }>> }
    }
    const clients = await serviceWorker.clients.matchAll()
    if (clients.some((client) => client.url === offscreenUrl)) return
  }
  await chrome.offscreen.createDocument({
    url: 'automation-sound.html',
    reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
    justification: 'Reproducir el aviso sonoro al finalizar una automatización',
  })
}

async function notifyAutomationResult(automation: ClickAutomation, success: boolean, error?: string) {
  await chrome.notifications.create(`click-automation-result:${automation.id}`, {
    type: 'basic',
    iconUrl: 'public/icons/icon128.png',
    title: success ? 'Automatización terminada' : 'Automatización interrumpida',
    message: success
      ? `“${automation.name}” terminó correctamente.`
      : `“${automation.name}” falló: ${error || 'error desconocido'}`,
    priority: 1,
  })
  if (success) {
    await ensureOffscreenDocument()
    await chrome.runtime.sendMessage({
      target: 'offscreen',
      action: 'PLAY_COMPLETION_SOUND',
    })
  }
}

export {}

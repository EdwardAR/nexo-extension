import {
  loadVault,
  RENEWAL_SCHEDULE_KEY,
  type RenewalScheduleItem,
} from '../popup/lib/storage'
import { getHostname } from '../shared/site'
import { differenceInDays } from '../shared/renewal'
import { clearVaultSession, getVaultSession } from '../shared/vault-session'
import {
  loadReminders,
  REMINDER_ALARM_PREFIX,
  REMINDERS_KEY,
  saveReminders,
  zonedInputToTimestamp,
  type ScheduledReminder,
} from '../shared/reminder'

const RENEWAL_ALARM = 'checkRenewals'
const NOTIFICATION_ID = 'password-renewal-reminder'
const REMINDER_WATCHDOG_ALARM = 'nexo-reminder-watchdog'

const reminderDeliveryInFlight = new Set<string>()
let reminderSchedulerInitialization: Promise<void> | null = null

chrome.runtime.onInstalled.addListener(() => {
  console.log('Nexo installed')
  scheduleRenewalChecks()
  scheduleReminderInitialization()
})

chrome.runtime.onStartup.addListener(() => {
  scheduleRenewalChecks()
  scheduleReminderInitialization()
})

chrome.windows.onRemoved.addListener(async (windowId) => {
  await reopenUnacknowledgedAlarmWindow(windowId)
  const openWindows = await chrome.windows.getAll()
  if (openWindows.length === 0) await clearVaultSession()
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const respond = async () => {
    switch (message.action) {
      case 'getAutofillData':
        return handleGetAutofillData(message.url)

      case 'saveDetectedCredentials':
        return handleSaveDetected()

      case 'CHECK_RENEWALS':
        await checkRenewals()
        return { success: true }

      case 'GET_TAB_ZOOM':
        return {
          success: true,
          zoom: _sender.tab?.id ? await chrome.tabs.getZoom(_sender.tab.id) : 1,
        }

      case 'SAVE_REMINDER':
        return saveReminder(message.reminder)

      case 'DELETE_REMINDER':
        return deleteReminder(message.id)

      case 'TEST_REMINDER_NOTIFICATION':
        return testReminderNotification()

      case 'ACKNOWLEDGE_REMINDER':
        return acknowledgeReminder(message.id)

      case 'SYNC_REMINDER_ALARMS':
        await initializeReminderScheduler()
        return { success: true }

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
  if (alarm.name.startsWith(REMINDER_ALARM_PREFIX)) {
    void showReminder(alarm.name.slice(REMINDER_ALARM_PREFIX.length))
  }
  if (alarm.name === REMINDER_WATCHDOG_ALARM) void checkDueReminders()
})

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === NOTIFICATION_ID || notificationId.startsWith(REMINDER_ALARM_PREFIX)) {
    void chrome.action.openPopup().catch(() => undefined)
  }
})

chrome.notifications.onButtonClicked.addListener((notificationId) => {
  if (notificationId.startsWith(REMINDER_ALARM_PREFIX)) {
    void acknowledgeReminder(notificationId.slice(REMINDER_ALARM_PREFIX.length))
  }
})

function reminderAlarmName(id: string) {
  return `${REMINDER_ALARM_PREFIX}${id}`
}

async function syncReminderAlarm(reminder: ScheduledReminder) {
  await chrome.alarms.clear(reminderAlarmName(reminder.id))
  if (reminder.enabled && reminder.scheduledAt > Date.now()) {
    await chrome.alarms.create(reminderAlarmName(reminder.id), {
      when: reminder.scheduledAt,
      periodInMinutes: 1,
    })
  } else if (reminder.enabled) {
    void showReminder(reminder.id)
  }
}

async function restoreReminderAlarms() {
  const reminders = await loadReminders()
  await Promise.all(
    reminders
      .filter((reminder) => reminder.enabled && reminder.scheduledAt <= Date.now())
      .map((reminder) => showReminder(reminder.id))
  )
  await Promise.all(reminders.map(syncReminderAlarm))
}

async function ensureReminderWatchdog() {
  const existing = await chrome.alarms.get(REMINDER_WATCHDOG_ALARM)
  if (!existing) {
    await chrome.alarms.create(REMINDER_WATCHDOG_ALARM, {
      delayInMinutes: 0.5,
      periodInMinutes: 0.5,
    })
  }
}

async function initializeReminderScheduler() {
  reminderSchedulerInitialization ??= (async () => {
    await ensureReminderWatchdog()
    await restoreReminderAlarms()
    await checkDueReminders()
  })().finally(() => {
    reminderSchedulerInitialization = null
  })
  return reminderSchedulerInitialization
}

function scheduleReminderInitialization() {
  void initializeReminderScheduler().catch(() => undefined)
}

async function checkDueReminders() {
  const reminders = await loadReminders()
  await Promise.all(
    reminders
      .filter((reminder) => reminder.enabled && reminder.scheduledAt <= Date.now())
      .map((reminder) => showReminder(reminder.id))
  )
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
    (value.scheduledLocalTime !== undefined && typeof value.scheduledLocalTime !== 'string') ||
    (value.timeZone !== undefined && value.timeZone !== 'America/Lima' && value.timeZone !== 'Europe/Madrid') ||
    !value.title.trim() ||
    !Number.isFinite(value.scheduledAt)
  ) return { success: false, error: 'El recordatorio no es válido' }

  const candidateReminder = value as ScheduledReminder
  const normalizedScheduledAt = candidateReminder.timeZone && candidateReminder.scheduledLocalTime
    ? zonedInputToTimestamp(candidateReminder.scheduledLocalTime, candidateReminder.timeZone)
    : candidateReminder.scheduledAt
  if (!Number.isFinite(normalizedScheduledAt)) {
    return { success: false, error: 'La fecha no existe en la zona horaria seleccionada' }
  }
  if (candidateReminder.enabled && normalizedScheduledAt <= Date.now()) {
    return { success: false, error: 'La fecha y hora programadas ya pasaron' }
  }
  const reminders = await loadReminders()
  const index = reminders.findIndex((item) => item.id === candidateReminder.id)
  const reminder: ScheduledReminder = {
    ...candidateReminder,
    scheduledAt: normalizedScheduledAt,
    title: candidateReminder.title.trim().slice(0, 60),
    message: candidateReminder.message.trim().slice(0, 160),
    deliveryStatus: candidateReminder.enabled ? 'scheduled' : candidateReminder.deliveryStatus,
    deliveryError: undefined,
  }
  if (index === -1) reminders.push(reminder)
  else reminders[index] = reminder
  await saveReminders(reminders)
  await syncReminderAlarm(reminder)
  await ensureReminderWatchdog()
  const alarm = await chrome.alarms.get(reminderAlarmName(reminder.id))
  if (reminder.enabled && !alarm) {
    return { success: false, error: 'Chrome no pudo registrar la alarma. Recarga Nexo e inténtalo otra vez.' }
  }
  return { success: true, scheduledFor: alarm?.scheduledTime }
}

async function deleteReminder(id: string) {
  const reminders = await loadReminders()
  const reminder = reminders.find((item) => item.id === id)
  await saveReminders(reminders.filter((item) => item.id !== id))
  await chrome.alarms.clear(reminderAlarmName(id))
  await chrome.notifications.clear(reminderAlarmName(id))
  if (reminder?.deliveryStatus === 'ringing') chrome.tts.stop()
  if (reminder?.alarmWindowId !== undefined) {
    await chrome.windows.remove(reminder.alarmWindowId).catch(() => undefined)
  }
  return { success: true }
}

function getNotificationPermission() {
  return new Promise<string>((resolve) => {
    chrome.notifications.getPermissionLevel(resolve)
  })
}

function createNotification(
  id: string,
  options: chrome.notifications.NotificationOptions<true>
) {
  return new Promise<string>((resolve, reject) => {
    chrome.notifications.create(id, options, (createdId) => {
      const error = chrome.runtime.lastError
      if (error) reject(new Error(error.message))
      else if (!createdId) reject(new Error('Chrome no confirmó la notificación'))
      else resolve(createdId)
    })
  })
}

async function showReminder(id: string) {
  if (reminderDeliveryInFlight.has(id)) return
  reminderDeliveryInFlight.add(id)
  try {
    await deliverReminder(id)
  } catch (error) {
    const reminders = await loadReminders()
    const index = reminders.findIndex((item) => item.id === id)
    if (index !== -1) {
      await showReminderFallback(reminders[index])
      await playReminderSound().catch(() => undefined)
      reminders[index] = {
        ...reminders[index],
        deliveryStatus: 'failed',
        deliveryError: error instanceof Error ? error.message : String(error),
      }
      await saveReminders(reminders)
    }
  } finally {
    reminderDeliveryInFlight.delete(id)
  }
}

async function deliverReminder(id: string) {
  const reminders = await loadReminders()
  const index = reminders.findIndex((item) => item.id === id)
  if (index === -1 || !reminders[index].enabled) return
  const reminder = reminders[index]
  const alarmWindowId = await openReminderAlarmWindow(reminder)
  await chrome.alarms.clear(reminderAlarmName(id))
  const permission = await getNotificationPermission()
  let notificationError: string | undefined
  if (permission === 'granted') {
    try {
      await createNotification(reminderAlarmName(id), {
        type: 'basic',
        iconUrl: 'public/icons/icon128.png',
        title: reminder.title,
        message: reminder.message || 'Tienes un recordatorio programado en Nexo.',
        contextMessage: reminder.timeZone === 'Europe/Madrid' ? 'Horario de España' : 'Horario de Perú',
        priority: 2,
        requireInteraction: true,
        silent: false,
        buttons: [{ title: 'Detener alarma' }],
      })
    } catch (error) {
      notificationError = error instanceof Error ? error.message : String(error)
    }
  } else {
    notificationError = 'Windows tiene bloqueadas las notificaciones nativas.'
  }
  await showReminderFallback(reminder)
  reminders[index] = {
    ...reminder,
    enabled: false,
    notifiedAt: Date.now(),
    deliveryStatus: 'ringing',
    deliveryError: notificationError,
    alarmWindowId,
  }
  await saveReminders(reminders)
  startSpokenAlarm(reminder.id, reminder.title)
}

function startSpokenAlarm(id: string, title: string) {
  const speak = async () => {
    const reminder = (await loadReminders()).find((item) => item.id === id)
    if (reminder?.deliveryStatus !== 'ringing') return
    chrome.tts.speak(`Alarma de Nexo. ${title}. Pulsa OK para detener la alarma.`, {
      lang: 'es-ES',
      volume: 1,
      rate: 1.05,
      pitch: 1.1,
      enqueue: false,
      onEvent: (event) => {
        if (event.type === 'end') void speak()
      },
    })
  }
  void speak()
}

async function openReminderAlarmWindow(reminder: ScheduledReminder) {
  const url = chrome.runtime.getURL('reminder-alarm.html') + '?' + new URLSearchParams({
    id: reminder.id,
    title: reminder.title,
    message: reminder.message || 'Tienes un recordatorio pendiente.',
  }).toString()
  const alarmWindow = await chrome.windows.create({
    url,
    type: 'popup',
    width: 420,
    height: 390,
    focused: true,
  })
  if (alarmWindow.id === undefined) throw new Error('No se pudo abrir la ventana de alarma')
  return alarmWindow.id
}

async function acknowledgeReminder(id: string) {
  chrome.tts.stop()
  const reminders = await loadReminders()
  const index = reminders.findIndex((item) => item.id === id)
  const windowId = index === -1 ? undefined : reminders[index].alarmWindowId
  if (index !== -1) {
    reminders[index] = {
      ...reminders[index],
      deliveryStatus: 'delivered',
      deliveryError: undefined,
      acknowledgedAt: Date.now(),
      alarmWindowId: undefined,
    }
    await saveReminders(reminders)
  }
  await chrome.notifications.clear(reminderAlarmName(id))
  await chrome.action.setBadgeText({ text: '' })
  await chrome.action.setTitle({ title: 'Nexo' })
  if (windowId !== undefined) {
    await chrome.windows.remove(windowId).catch(() => undefined)
  }
  return { success: true }
}

async function reopenUnacknowledgedAlarmWindow(closedWindowId: number) {
  const reminders = await loadReminders()
  const reminder = reminders.find(
    (item) => item.deliveryStatus === 'ringing' && item.alarmWindowId === closedWindowId
  )
  if (!reminder) return
  await new Promise((resolve) => setTimeout(resolve, 400))
  const alarmWindowId = await openReminderAlarmWindow(reminder)
  const latest = await loadReminders()
  const index = latest.findIndex((item) => item.id === reminder.id)
  if (index === -1 || latest[index].deliveryStatus !== 'ringing') {
    await chrome.windows.remove(alarmWindowId).catch(() => undefined)
    return
  }
  latest[index] = { ...latest[index], alarmWindowId }
  await saveReminders(latest)
}

async function showReminderFallback(reminder: ScheduledReminder) {
  await chrome.action.setBadgeBackgroundColor({ color: '#dc2626' })
  await chrome.action.setBadgeText({ text: '!' })
  await chrome.action.setTitle({ title: `Nexo · ${reminder.title}` })
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  if (!tab?.id || !tab.url?.startsWith('http')) return
  await chrome.tabs.sendMessage(tab.id, {
    action: 'SHOW_NEXO_REMINDER',
    title: reminder.title,
    message: reminder.message || 'Tienes un recordatorio programado en Nexo.',
  }).catch(() => undefined)
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
    justification: 'Reproducir los avisos sonoros de Nexo',
  })
}

async function playReminderSound() {
  await ensureOffscreenDocument()
  const response = await chrome.runtime.sendMessage({
    target: 'offscreen',
    action: 'PLAY_REMINDER_SOUND',
  })
  if (!response?.success) {
    throw new Error(response?.error || 'El reproductor no confirmó el sonido')
  }
}

async function testReminderNotification() {
  const permission = await getNotificationPermission()
  const testReminder: ScheduledReminder = {
    id: `test-${Date.now()}`,
    title: 'Prueba de Nexo',
    message: 'Las alertas de Nexo están funcionando.',
    scheduledAt: Date.now(),
    timeZone: 'America/Lima',
    enabled: false,
    createdAt: Date.now(),
  }
  await openReminderAlarmWindow(testReminder)
  chrome.tts.speak('Alarma de Nexo. Prueba de sonido.', {
    lang: 'es-ES',
    volume: 1,
    rate: 1.05,
  })
  await showReminderFallback(testReminder)
  if (permission === 'granted') {
    await createNotification(reminderAlarmName(testReminder.id), {
      type: 'basic',
      iconUrl: 'public/icons/icon128.png',
      title: testReminder.title,
      message: 'Las notificaciones y el sonido de tus alertas están funcionando.',
      contextMessage: 'Aviso de prueba',
      priority: 2,
      requireInteraction: true,
      silent: false,
    })
  }
  return { success: true, nativeNotification: permission === 'granted' }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && RENEWAL_SCHEDULE_KEY in changes) {
    void checkRenewals()
  }
  if (areaName === 'local' && REMINDERS_KEY in changes) {
    scheduleReminderInitialization()
  }
})

async function handleGetAutofillData(url: string) {
  const session = await getVaultSession()
  if (!session?.password) return { success: false, error: 'Vault locked' }

  const currentHostname = getHostname(url)
  const entries = await loadVault(session.password)
  const suggestions = entries
    .filter((entry) => getHostname(entry.site) === currentHostname)
    .map(({ site, username, password }) => ({ site, username, password }))

  return { success: true, suggestions }
}

async function handleSaveDetected() {
  const session = await getVaultSession()
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

export {}

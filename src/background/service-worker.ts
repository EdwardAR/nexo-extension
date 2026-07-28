import {
  loadVault,
  RENEWAL_SCHEDULE_KEY,
  type RenewalScheduleItem,
} from '../popup/lib/storage'
import { getHostname } from '../shared/site'
import { differenceInDays } from '../shared/renewal'

const SESSION_KEY = 'vaultSession'
const RENEWAL_ALARM = 'checkRenewals'
const NOTIFICATION_ID = 'password-renewal-reminder'

interface VaultSession {
  active: boolean
  password: string
}

async function getSession(): Promise<VaultSession | null> {
  const result = await chrome.storage.session.get(SESSION_KEY)
  return result[SESSION_KEY] ?? null
}

async function clearSession() {
  await chrome.storage.session.remove([SESSION_KEY, 'sessionActive'])
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Password Vault installed')
  scheduleRenewalChecks()
})

chrome.runtime.onStartup.addListener(scheduleRenewalChecks)

chrome.windows.onRemoved.addListener(async () => {
  const openWindows = await chrome.windows.getAll()
  if (openWindows.length === 0) await clearSession()
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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
})

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === NOTIFICATION_ID) {
    void chrome.action.openPopup().catch(() => undefined)
  }
})

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

export {}

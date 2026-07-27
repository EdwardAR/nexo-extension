const SESSION_KEY = 'vaultSession'
const AUTO_LOCK_ALARM = 'autoLock'
const AUTO_LOCK_MINUTES = 5

interface VaultSession {
  active: boolean
  password: string
}

function resetAutoLock() {
  chrome.alarms.create(AUTO_LOCK_ALARM, { delayInMinutes: AUTO_LOCK_MINUTES })
}

async function getSession(): Promise<VaultSession | null> {
  const result = await chrome.storage.session.get(SESSION_KEY)
  return result[SESSION_KEY] ?? null
}

async function clearSession() {
  await chrome.storage.session.remove([SESSION_KEY, 'sessionActive'])
  await chrome.alarms.clear(AUTO_LOCK_ALARM)
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Password Vault installed')
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== AUTO_LOCK_ALARM) return

  await clearSession()
  chrome.runtime.sendMessage(
    { action: 'SESSION_LOCKED' },
    () => void chrome.runtime.lastError
  )
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
        resetAutoLock()
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
        resetAutoLock()
        return { password: session.password }
      }

      default:
        return { error: 'Unknown action' }
    }
  }

  respond()
    .then(sendResponse)
    .catch((error) => sendResponse({ error: String(error) }))

  return true
})

async function handleGetAutofillData(url: string) {
  const session = await getSession()
  if (!session?.password) return { success: false, error: 'Vault locked' }

  const currentHostname = getHostname(url)
  const entries = await loadVault(session.password)
  const suggestions = entries
    .filter((entry) => getHostname(entry.site) === currentHostname)
    .map(({ site, username, password }) => ({ site, username, password }))

  resetAutoLock()
  return { success: true, suggestions }
}

async function handleSaveDetected() {
  const session = await getSession()
  if (!session?.password) {
    return { success: false, error: 'Vault locked - cannot save credentials' }
  }

  resetAutoLock()
  return { success: true }
}

export {}
import { loadVault } from '../popup/lib/storage'
import { getHostname } from '../shared/site'

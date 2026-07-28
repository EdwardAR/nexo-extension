import { loadVault } from '../popup/lib/storage'
import { getHostname } from '../shared/site'

const SESSION_KEY = 'vaultSession'

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
})

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

  return { success: true, suggestions }
}

async function handleSaveDetected() {
  const session = await getSession()
  if (!session?.password) {
    return { success: false, error: 'Vault locked - cannot save credentials' }
  }

  return { success: true }
}

export {}

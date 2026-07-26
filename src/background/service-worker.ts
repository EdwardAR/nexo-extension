// Session management - persistent across popup lifecycle
let masterPassword: string | null = null
let sessionActive = false

chrome.runtime.onInstalled.addListener(() => {
  console.log('Password Vault installed')
})

chrome.alarms.create('autoLock', { periodInMinutes: 5 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'autoLock') {
    // Lock the vault and clear session
    masterPassword = null
    sessionActive = false
    chrome.storage.session.set({ sessionActive: false })
    // Notify all popup instances
    chrome.runtime.sendMessage(
      { action: 'SESSION_LOCKED' },
      () => chrome.runtime.lastError // Ignore if no popup is open
    )
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getAutofillData') {
    handleGetAutofillData(message.url, sendResponse)
    return true
  }

  if (message.action === 'saveDetectedCredentials') {
    handleSaveDetected(message.credentials, sendResponse)
    return true
  }

  // Session management messages
  if (message.action === 'UNLOCK_VAULT') {
    masterPassword = message.password
    sessionActive = true
    chrome.storage.session.set({ sessionActive: true })
    sendResponse({ success: true })
    return true
  }

  if (message.action === 'LOCK_VAULT') {
    masterPassword = null
    sessionActive = false
    chrome.storage.session.set({ sessionActive: false })
    sendResponse({ success: true })
    return true
  }

  if (message.action === 'GET_SESSION_STATUS') {
    sendResponse({ sessionActive, hasPassword: masterPassword !== null })
    return true
  }

  if (message.action === 'GET_PASSWORD') {
    if (masterPassword) {
      sendResponse({ password: masterPassword })
    } else {
      sendResponse({ error: 'Session not active' })
    }
    return true
  }
})

async function handleGetAutofillData(
  url: string,
  sendResponse: (response: any) => void
) {
  try {
    if (!masterPassword) {
      sendResponse({ success: false, error: 'Vault locked' })
      return
    }
    sendResponse({ success: true })
  } catch (error) {
    sendResponse({ success: false, error: String(error) })
  }
}

async function handleSaveDetected(
  credentials: { site: string; username: string; password: string },
  sendResponse: (response: any) => void
) {
  try {
    if (!masterPassword) {
      sendResponse({ success: false, error: 'Vault locked - cannot save credentials' })
      return
    }
    sendResponse({ success: true })
  } catch (error) {
    sendResponse({ success: false, error: String(error) })
  }
}

export {}

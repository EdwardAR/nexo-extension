chrome.runtime.onInstalled.addListener(() => {
  console.log('Password Vault installed')
})

chrome.alarms.create('autoLock', { periodInMinutes: 5 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'autoLock') {
    chrome.storage.local.set({ locked: true })
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
})

async function handleGetAutofillData(
  url: string,
  sendResponse: (response: any) => void
) {
  try {
    const result = await chrome.storage.local.get('vault_data')
    if (!result.vault_data) {
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
    const result = await chrome.storage.local.get('password_vault')
    sendResponse({ success: true })
  } catch (error) {
    sendResponse({ success: false, error: String(error) })
  }
}

export {}

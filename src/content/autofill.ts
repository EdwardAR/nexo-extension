interface AutofillSuggestion {
  username: string
  password: string
  site: string
}

function findPasswordInputs(): HTMLInputElement[] {
  return Array.from(document.querySelectorAll('input[type="password"]'))
}

function getUsernameInput(passwordInput: HTMLInputElement): HTMLInputElement | null {
  const form = passwordInput.form
  if (!form) return null
  const inputs = form.querySelectorAll('input:not([type="password"])')
  for (const input of inputs) {
    const htmlInput = input as HTMLInputElement
    const type = htmlInput.type.toLowerCase()
    if (
      type === 'email' ||
      type === 'text' ||
      htmlInput.name.toLowerCase().includes('user') ||
      htmlInput.name.toLowerCase().includes('email') ||
      htmlInput.name.toLowerCase().includes('login') ||
      htmlInput.autocomplete === 'username' ||
      htmlInput.autocomplete === 'email'
    ) {
      return htmlInput
    }
  }
  return null
}

function createAutofillButton(passwordInput: HTMLInputElement): HTMLElement {
  const existing = passwordInput.parentElement?.querySelector('.pv-autofill-btn')
  if (existing) return existing as HTMLElement

  const btn = document.createElement('button')
  btn.className = 'pv-autofill-btn'
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `
  btn.title = 'Password Vault - Autofill'
  btn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    showSuggestions(passwordInput, btn)
  })

  return btn
}

async function showSuggestions(passwordInput: HTMLInputElement, anchor: HTMLElement) {
  const existing = document.querySelector('.pv-suggestions')
  if (existing) existing.remove()

  const usernameInput = getUsernameInput(passwordInput)
  const suggestions = document.createElement('div')
  suggestions.className = 'pv-suggestions'

  positionSuggestions(suggestions, anchor)
  document.body.appendChild(suggestions)
  setSuggestionMessage(suggestions, 'Buscando accesos…')

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getAutofillData',
      url: window.location.href,
    })

    if (!response?.success) {
      setSuggestionMessage(suggestions, 'Bóveda bloqueada — abre la extensión')
    } else if (!Array.isArray(response.suggestions) || response.suggestions.length === 0) {
      setSuggestionMessage(suggestions, 'No hay accesos para este sitio')
    } else {
      suggestions.replaceChildren()
      response.suggestions.forEach((suggestion: AutofillSuggestion) => {
        const item = document.createElement('div')
        item.className = 'pv-suggestion-item pv-suggestion-clickable'
        item.innerHTML = `
          <div class="pv-suggestion-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="pv-suggestion-text">
            <div class="pv-suggestion-username">${escapeHtml(suggestion.username)}</div>
          </div>
        `
        item.addEventListener('click', () => {
          if (usernameInput) setInputValue(usernameInput, suggestion.username)
          setInputValue(passwordInput, suggestion.password)
          suggestions.remove()
        })
        suggestions.appendChild(item)
      })
    }
  } catch {
    setSuggestionMessage(suggestions, 'No se pudo acceder a la bóveda')
  }

  setTimeout(() => {
    document.addEventListener('click', () => suggestions.remove(), { once: true })
  }, 0)
}

function setSuggestionMessage(container: HTMLElement, message: string) {
  const item = document.createElement('div')
  item.className = 'pv-suggestion-item'
  item.textContent = message
  container.replaceChildren(item)
}

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  )?.set

  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function positionSuggestions(suggestions: HTMLElement, anchor: HTMLElement) {
  const rect = anchor.getBoundingClientRect()
  suggestions.style.position = 'fixed'
  suggestions.style.top = `${rect.bottom + 4}px`
  suggestions.style.right = `${window.innerWidth - rect.right}px`
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function injectStyles() {
  const style = document.createElement('style')
  style.textContent = `
    .pv-autofill-btn {
      position: absolute !important;
      right: 4px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      width: 28px !important;
      height: 28px !important;
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
      border-radius: 6px !important;
      background: #6366f1 !important;
      color: white !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 2147483647 !important;
      opacity: 0.9 !important;
      transition: opacity 0.15s ease !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15) !important;
    }
    .pv-autofill-btn:hover {
      opacity: 1 !important;
      background: #4f46e5 !important;
    }
    .pv-suggestions {
      position: fixed !important;
      z-index: 2147483647 !important;
      min-width: 200px !important;
      max-width: 280px !important;
      background: white !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
      overflow: hidden !important;
      animation: pvFadeIn 0.15s ease-out !important;
    }
    .pv-suggestion-item {
      padding: 8px 12px !important;
      font-size: 13px !important;
      color: #334155 !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      border-bottom: 1px solid #f1f5f9 !important;
    }
    .pv-suggestion-item:last-child {
      border-bottom: none !important;
    }
    .pv-suggestion-clickable {
      cursor: pointer !important;
      transition: background 0.1s ease !important;
    }
    .pv-suggestion-clickable:hover {
      background: #f8fafc !important;
    }
    .pv-suggestion-icon {
      width: 28px !important;
      height: 28px !important;
      border-radius: 6px !important;
      background: #eef2ff !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-shrink: 0 !important;
    }
    .pv-suggestion-icon svg {
      color: #6366f1 !important;
    }
    .pv-suggestion-username {
      font-weight: 500 !important;
      font-size: 12px !important;
      color: #0f172a !important;
    }
    @keyframes pvFadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
  document.head.appendChild(style)
}

function setupPasswordInput(input: HTMLInputElement) {
  if (input.dataset.pvAttached) return
  input.dataset.pvAttached = 'true'

  if (input.parentElement) {
    input.parentElement.style.position = 'relative'
  }

  const btn = createAutofillButton(input)
  input.parentElement?.appendChild(btn)
}

function observeNewInputs() {
  const observer = new MutationObserver(() => {
    findPasswordInputs().forEach(setupPasswordInput)
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

let automationRecording = false
let recordedClickCount = 0

function escapeSelector(value: string) {
  return CSS.escape(value)
}

function isUniqueSelector(selector: string) {
  try {
    return document.querySelectorAll(selector).length === 1
  } catch {
    return false
  }
}

function getElementSelector(element: Element): string {
  if (element.id) {
    const selector = `#${escapeSelector(element.id)}`
    if (isUniqueSelector(selector)) return selector
  }

  for (const attribute of ['data-testid', 'data-test', 'data-cy', 'name', 'aria-label']) {
    const value = element.getAttribute(attribute)
    if (!value) continue
    const selector = `${element.tagName.toLowerCase()}[${attribute}="${escapeSelector(value)}"]`
    if (isUniqueSelector(selector)) return selector
  }

  const parts: string[] = []
  let current: Element | null = element
  while (current && current !== document.documentElement && parts.length < 7) {
    let part = current.tagName.toLowerCase()
    const stableClasses = Array.from(current.classList)
      .filter((className) => !className.startsWith('pv-') && !/\d{3,}/.test(className))
      .slice(0, 2)
    if (stableClasses.length) {
      part += stableClasses.map((className) => `.${escapeSelector(className)}`).join('')
    }
    const parentElement: HTMLElement | null = current.parentElement
    if (parentElement) {
      const currentTag = current.tagName
      const siblings: Element[] = Array.from(parentElement.children).filter(
        (child: Element) => child.tagName === currentTag
      )
      if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(current) + 1})`
    }
    parts.unshift(part)
    const selector = parts.join(' > ')
    if (isUniqueSelector(selector)) return selector
    current = parentElement
  }
  return parts.join(' > ')
}

function getClickLabel(element: Element) {
  return (
    element.getAttribute('aria-label') ||
    element.getAttribute('title') ||
    element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) ||
    element.tagName.toLowerCase()
  )
}

function updateRecordingBadge() {
  const counter = document.querySelector<HTMLElement>('[data-pv-recording-count]')
  if (counter) counter.textContent = `${recordedClickCount} clic${recordedClickCount === 1 ? '' : 's'}`
}

function showRecordingToolbar(initialCount = 0) {
  recordedClickCount = initialCount
  automationRecording = true
  document.querySelector('[data-pv-automation-toolbar]')?.remove()

  const toolbar = document.createElement('div')
  toolbar.dataset.pvAutomationToolbar = 'true'
  toolbar.style.cssText = [
    'position:fixed', 'right:18px', 'bottom:18px', 'z-index:2147483647',
    'display:flex', 'align-items:center', 'gap:10px', 'padding:10px 12px',
    'border-radius:12px', 'background:#0f172a', 'color:white',
    'font:600 13px/1.2 system-ui,sans-serif', 'box-shadow:0 8px 30px rgba(0,0,0,.3)',
  ].join(';')
  toolbar.innerHTML = `
    <span style="width:9px;height:9px;border-radius:999px;background:#ef4444;box-shadow:0 0 0 4px rgba(239,68,68,.2)"></span>
    <span>Grabando · <span data-pv-recording-count></span></span>
    <button data-pv-stop-recording style="border:0;border-radius:8px;padding:7px 10px;background:#fff;color:#0f172a;font:700 12px system-ui;cursor:pointer">Terminar y guardar</button>
  `
  document.documentElement.appendChild(toolbar)
  updateRecordingBadge()

  toolbar.querySelector('[data-pv-stop-recording]')?.addEventListener('click', async (event) => {
    event.preventDefault()
    event.stopPropagation()
    automationRecording = false
    toolbar.remove()
    await chrome.runtime.sendMessage({ action: 'FINISH_AUTOMATION_RECORDING' })
  })
}

document.addEventListener('click', (event) => {
  if (!automationRecording) return
  const element = event.target instanceof Element ? event.target.closest('button, a, input, select, [role="button"], [onclick]') || event.target : null
  if (!element || element.closest('[data-pv-automation-toolbar]')) return
  const selector = getElementSelector(element)
  if (!selector) return
  recordedClickCount += 1
  updateRecordingBadge()
  void chrome.runtime.sendMessage({
    action: 'RECORD_AUTOMATION_CLICK',
    step: {
      selector,
      pageUrl: window.location.href,
      label: getClickLabel(element),
    },
  }).catch(() => undefined)
}, true)

async function findElement(selector: string): Promise<HTMLElement | null> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const element = document.querySelector(selector)
    if (element instanceof HTMLElement) return element
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  return null
}

async function playAutomationStep(selector: string) {
  const element = await findElement(selector)
  if (!element) throw new Error(`No se encontró el elemento: ${selector}`)
  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const previousOutline = element.style.outline
  element.style.outline = '3px solid #6366f1'
  await new Promise((resolve) => setTimeout(resolve, 300))
  setTimeout(() => {
    element.click()
    setTimeout(() => { element.style.outline = previousOutline }, 500)
  }, 50)
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'START_CLICK_RECORDING') {
    showRecordingToolbar(message.count || 0)
    sendResponse({ success: true })
    return
  }
  if (message.action === 'PLAY_AUTOMATION_STEP') {
    playAutomationStep(message.selector)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: String(error) }))
    return true
  }
})

void chrome.runtime.sendMessage({ action: 'GET_ACTIVE_RECORDING' })
  .then((response) => {
    if (response?.active) showRecordingToolbar(response.count || 0)
  })
  .catch(() => undefined)

injectStyles()
findPasswordInputs().forEach(setupPasswordInput)
observeNewInputs()

export {}

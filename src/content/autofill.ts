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
  btn.title = 'Nexo - Autocompletar'
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
    .pv-recorded-click {
      position: fixed !important;
      z-index: 2147483646 !important;
      width: 26px !important;
      height: 26px !important;
      border: 3px solid #6366f1 !important;
      border-radius: 999px !important;
      background: rgba(99, 102, 241, 0.18) !important;
      pointer-events: none !important;
      transform: translate(-50%, -50%) scale(0.35);
      animation: pvRecordedClick 0.62s ease-out forwards !important;
    }
    .pv-recorded-click-disabled {
      border-color: #f59e0b !important;
      background: rgba(245, 158, 11, 0.2) !important;
    }
    @keyframes pvFadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pvRecordedClick {
      0% { opacity: 1; transform: translate(-50%, -50%) scale(0.35); }
      75% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.35); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(1.65); }
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
let confirmedClickCount = 0
let pendingClickCount = 0
let recordingCounterElement: HTMLElement | null = null
let recordingLastStepElement: HTMLElement | null = null

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

function getElementSelectors(element: Element): string[] {
  const selectors: string[] = []
  const addUnique = (selector: string) => {
    if (selector && isUniqueSelector(selector) && !selectors.includes(selector)) {
      selectors.push(selector)
    }
  }

  if (element.id) {
    addUnique(`#${escapeSelector(element.id)}`)
  }

  for (const attribute of [
    'data-control-name',
    'data-testid',
    'data-test',
    'data-cy',
    'aria-label',
    'name',
    'title',
  ]) {
    const value = element.getAttribute(attribute)
    if (!value) continue
    addUnique(`${element.tagName.toLowerCase()}[${attribute}="${escapeSelector(value)}"]`)
    addUnique(`[${attribute}="${escapeSelector(value)}"]`)
  }

  const role = element.getAttribute('role')
  const ariaLabel = element.getAttribute('aria-label')
  if (role && ariaLabel) {
    addUnique(`[role="${escapeSelector(role)}"][aria-label="${escapeSelector(ariaLabel)}"]`)
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
    addUnique(selector)
    current = parentElement
  }
  return selectors
}

function getClickLabel(element: Element) {
  return (
    element.getAttribute('data-control-name') ||
    element.getAttribute('aria-label') ||
    element.getAttribute('title') ||
    element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) ||
    element.tagName.toLowerCase()
  )
}

function isElementDisabled(element: Element) {
  return (
    element.matches(':disabled') ||
    element.getAttribute('aria-disabled') === 'true' ||
    ('disabled' in element && Boolean((element as HTMLButtonElement).disabled))
  )
}

function getClickableElement(event: Event): Element | null {
  const candidates = event.composedPath().filter(
    (item): item is Element => item instanceof Element
  )
  const clickableSelector = [
    '[data-control-name]',
    '[data-testid]',
    'button',
    'a',
    'input',
    'select',
    '[role="button"]',
    '[role="menuitem"]',
    '[role="option"]',
    '[role="tab"]',
    '[onclick]',
    '[tabindex]',
  ].join(',')

  for (const candidate of candidates) {
    if (candidate.matches(clickableSelector)) return candidate
    const closest = candidate.closest(clickableSelector)
    if (closest) return closest
  }
  return candidates[0] || null
}

function showRecordedClickMarker(event: PointerEvent, disabled: boolean) {
  const marker = document.createElement('span')
  marker.className = `pv-recorded-click${disabled ? ' pv-recorded-click-disabled' : ''}`
  marker.style.left = `${event.clientX}px`
  marker.style.top = `${event.clientY}px`
  document.documentElement.appendChild(marker)
  setTimeout(() => marker.remove(), 650)
}

function updateRecordingBadge() {
  if (recordingCounterElement) {
    recordingCounterElement.textContent = String(recordedClickCount)
  }
}

function showRecordingToolbar(initialCount = 0) {
  confirmedClickCount = Math.max(confirmedClickCount, initialCount)
  recordedClickCount = confirmedClickCount + pendingClickCount
  automationRecording = true
  if (window !== window.top) return
  const existing = document.querySelector('[data-pv-automation-toolbar]')
  if (existing) {
    updateRecordingBadge()
    return
  }

  const toolbar = document.createElement('div')
  toolbar.dataset.pvAutomationToolbar = 'true'
  toolbar.style.cssText = [
    'position:fixed', 'right:18px', 'bottom:18px', 'z-index:2147483647',
    'display:grid', 'grid-template-columns:auto 1fr', 'gap:10px 12px', 'padding:12px',
    'min-width:250px', 'border:1px solid rgba(255,255,255,.14)',
    'border-radius:16px', 'background:linear-gradient(145deg,#0f172a,#1e293b)', 'color:white',
    'font:600 13px/1.2 system-ui,sans-serif', 'box-shadow:0 16px 42px rgba(15,23,42,.38)',
  ].join(';')
  toolbar.innerHTML = `
    <span style="grid-row:1/3;display:flex;width:42px;height:42px;align-items:center;justify-content:center;border-radius:12px;background:rgba(239,68,68,.14)">
      <span style="width:11px;height:11px;border-radius:999px;background:#ef4444;box-shadow:0 0 0 5px rgba(239,68,68,.16)"></span>
    </span>
    <span style="display:flex;align-items:center;justify-content:space-between;gap:16px">
      <span style="font-size:12px;color:#cbd5e1">Grabando secuencia</span>
      <strong style="display:flex;align-items:baseline;gap:4px;color:#fff">
        <span data-pv-recording-count style="font-size:20px;line-height:1">0</span>
        <small style="font-size:10px;color:#94a3b8">CLICS</small>
      </strong>
    </span>
    <span data-pv-recording-last style="max-width:185px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:#94a3b8">Esperando el primer clic…</span>
    <button data-pv-stop-recording style="grid-column:1/3;border:0;border-radius:10px;padding:9px 12px;background:#fff;color:#0f172a;font:700 12px system-ui;cursor:pointer">Terminar y guardar</button>
  `
  document.documentElement.appendChild(toolbar)
  recordingCounterElement = toolbar.querySelector('[data-pv-recording-count]')
  recordingLastStepElement = toolbar.querySelector('[data-pv-recording-last]')
  updateRecordingBadge()

  const stopButton = toolbar.querySelector<HTMLButtonElement>('[data-pv-stop-recording]')
  stopButton?.addEventListener('click', async (event) => {
    event.preventDefault()
    event.stopPropagation()
    automationRecording = false
    stopButton.disabled = true
    stopButton.textContent = 'Guardando secuencia…'
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'FINISH_AUTOMATION_RECORDING',
      })
      if (!response?.success) throw new Error(response?.error || 'No se pudo guardar')
      toolbar.remove()
      recordingCounterElement = null
      recordingLastStepElement = null
      recordedClickCount = 0
      confirmedClickCount = 0
      pendingClickCount = 0
    } catch {
      automationRecording = true
      stopButton.disabled = false
      stopButton.textContent = 'Reintentar guardar'
      if (recordingLastStepElement) {
        recordingLastStepElement.textContent = 'No se pudo guardar. Inténtalo otra vez.'
        recordingLastStepElement.style.color = '#fca5a5'
      }
    }
  })
}

window.addEventListener('pointerdown', (event) => {
  if (!automationRecording) return
  if (event.button !== 0 || !event.isPrimary) return
  const element = getClickableElement(event)
  if (!element || element.closest('[data-pv-automation-toolbar]')) return
  const selectors = getElementSelectors(element)
  if (!selectors.length) return
  const label = getClickLabel(element)
  const disabledWhenRecorded = isElementDisabled(element)
  showRecordedClickMarker(event, disabledWhenRecorded)
  pendingClickCount += 1
  recordedClickCount = confirmedClickCount + pendingClickCount
  if (recordingLastStepElement) {
    recordingLastStepElement.textContent = disabledWhenRecorded
      ? `Último: ${label} · deshabilitado`
      : `Último: ${label}`
    recordingLastStepElement.style.color = disabledWhenRecorded ? '#fbbf24' : '#94a3b8'
  }
  updateRecordingBadge()
  void chrome.runtime.sendMessage({
    action: 'RECORD_AUTOMATION_CLICK',
    step: {
      selector: selectors[0],
      fallbackSelectors: selectors.slice(1),
      pageUrl: window.location.href,
      frameUrl: window.location.href,
      label,
      disabledWhenRecorded,
    },
  }).then((response) => {
    pendingClickCount = Math.max(0, pendingClickCount - 1)
    if (response?.success && typeof response.count === 'number') {
      confirmedClickCount = Math.max(confirmedClickCount, response.count)
    }
    recordedClickCount = confirmedClickCount + pendingClickCount
    updateRecordingBadge()
  }).catch(() => {
    pendingClickCount = Math.max(0, pendingClickCount - 1)
    recordedClickCount = confirmedClickCount + pendingClickCount
    updateRecordingBadge()
  })
}, true)

function prepareAutomationStep(selectors: string[]) {
  let element: HTMLElement | null = null
  for (const selector of selectors) {
    const candidate = document.querySelector(selector)
    if (candidate instanceof HTMLElement) {
      element = candidate
      break
    }
  }
  if (!element) {
    return {
      accepted: false,
      retryable: true,
      error: `No se encontró el elemento: ${selectors[0]}`,
    }
  }
  if (isElementDisabled(element)) {
    return {
      accepted: false,
      retryable: true,
      error: 'El control continúa deshabilitado',
    }
  }
  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const previousOutline = element.style.outline
  element.style.outline = '3px solid #6366f1'
  setTimeout(() => {
    element.click()
    setTimeout(() => { element.style.outline = previousOutline }, 500)
  }, 100)
  return { accepted: true, success: true }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'START_CLICK_RECORDING') {
    showRecordingToolbar(message.count || 0)
    sendResponse({ success: true })
    return
  }
  if (message.action === 'PLAY_AUTOMATION_STEP') {
    sendResponse(prepareAutomationStep([
      message.selector,
      ...(Array.isArray(message.fallbackSelectors) ? message.fallbackSelectors : []),
    ]))
    return
  }
  if (message.action === 'UPDATE_RECORDING_COUNT' && window === window.top) {
    if (typeof message.count === 'number') {
      confirmedClickCount = Math.max(confirmedClickCount, message.count)
      recordedClickCount = confirmedClickCount + pendingClickCount
      updateRecordingBadge()
    }
    if (recordingLastStepElement && message.label) {
      recordingLastStepElement.textContent = message.disabledWhenRecorded
        ? `Último: ${message.label} · deshabilitado`
        : `Último: ${message.label}`
      recordingLastStepElement.style.color = message.disabledWhenRecorded
        ? '#fbbf24'
        : '#94a3b8'
    }
    sendResponse({ success: true })
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

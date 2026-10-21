import './floating-clock'
import './reminder-overlay'

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
  btn.type = 'button'
  btn.setAttribute('aria-label', 'Autocompletar con Nexo')
  const icon = document.createElement('img')
  icon.src = chrome.runtime.getURL('public/icons/icon-source.svg')
  icon.alt = ''
  icon.width = 20
  icon.height = 20
  icon.setAttribute('aria-hidden', 'true')
  btn.appendChild(icon)
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
      background: transparent !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 2147483647 !important;
      opacity: 0.96 !important;
      transition: opacity 0.15s ease, transform 0.15s ease !important;
    }
    .pv-autofill-btn:hover {
      opacity: 1 !important;
      transform: translateY(-50%) scale(1.05) !important;
    }
    .pv-autofill-btn:focus-visible {
      outline: 2px solid #818cf8 !important;
      outline-offset: 2px !important;
    }
    .pv-autofill-btn img {
      display: block !important;
      width: 20px !important;
      height: 20px !important;
      border-radius: 5px !important;
      pointer-events: none !important;
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

injectStyles()
findPasswordInputs().forEach(setupPasswordInput)
observeNewInputs()
export {}

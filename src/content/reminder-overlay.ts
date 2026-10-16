function showNexoReminder(title: string, message: string) {
  if (window !== window.top) return
  document.getElementById('nexo-reminder-alert')?.remove()
  const alert = document.createElement('aside')
  alert.id = 'nexo-reminder-alert'
  alert.setAttribute('role', 'alert')
  alert.style.cssText = [
    'position:fixed',
    'right:20px',
    'top:20px',
    'z-index:2147483647',
    'width:min(340px,calc(100vw - 40px))',
    'box-sizing:border-box',
    'padding:16px',
    'border:1px solid rgba(103,232,249,.45)',
    'border-radius:18px',
    'background:linear-gradient(135deg,#0f172a,#312e81 58%,#0e7490)',
    'box-shadow:0 20px 55px rgba(15,23,42,.4)',
    'color:#fff',
    'font:14px/1.5 Inter,ui-sans-serif,system-ui,-apple-system,sans-serif',
  ].join(';')
  const heading = document.createElement('strong')
  heading.textContent = title
  heading.style.cssText = 'display:block;padding-right:28px;font-size:15px;margin-bottom:5px'
  const detail = document.createElement('div')
  detail.textContent = message
  detail.style.cssText = 'color:#cffafe;font-size:13px'
  const close = document.createElement('button')
  close.type = 'button'
  close.textContent = '×'
  close.setAttribute('aria-label', 'Cerrar recordatorio')
  close.style.cssText = 'position:absolute;right:10px;top:8px;border:0;background:transparent;color:#fff;font-size:24px;cursor:pointer'
  close.addEventListener('click', () => alert.remove())
  alert.append(heading, detail, close)
  document.documentElement.appendChild(alert)
  setTimeout(() => alert.remove(), 30_000)
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action !== 'SHOW_NEXO_REMINDER') return
  showNexoReminder(
    String(message.title || 'Recordatorio de Nexo'),
    String(message.message || '')
  )
  sendResponse({ success: true })
})

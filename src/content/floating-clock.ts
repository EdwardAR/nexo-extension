import {
  FLOATING_CLOCK_ENABLED_KEY,
  FLOATING_CLOCK_POSITION_KEY,
  isFloatingClockEnabled,
  loadFloatingClockPosition,
  saveFloatingClockPosition,
  setFloatingClockEnabled,
  type FloatingClockPosition,
} from '../shared/floating-clock'

const HOST_ID = 'nexo-floating-clock-host'
const CLOCK_WIDTH = 310
const VIEWPORT_MARGIN = 10

let clockHost: HTMLElement | null = null
let clockTimer: number | undefined
let currentZoom = 1
let currentLayout: FloatingClockPosition = {
  x: 1,
  y: 0.12,
  mode: 'viewport-ratio',
  expanded: true,
}

function removeFloatingClock() {
  if (clockTimer !== undefined) window.clearInterval(clockTimer)
  clockTimer = undefined
  clockHost?.remove()
  clockHost = null
}

async function loadTabZoom() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'GET_TAB_ZOOM' })
    const zoom = Number(response?.zoom)
    return Number.isFinite(zoom) && zoom > 0 ? zoom : 1
  } catch {
    return 1
  }
}

function getPhysicalViewport() {
  return {
    width: window.innerWidth * currentZoom,
    height: window.innerHeight * currentZoom,
  }
}

function getPhysicalClockSize() {
  return {
    width: clockHost?.offsetWidth || CLOCK_WIDTH,
    height: clockHost?.offsetHeight || 96,
  }
}

function clampPhysicalPosition(x: number, y: number) {
  const viewport = getPhysicalViewport()
  const size = getPhysicalClockSize()
  return {
    x: Math.max(VIEWPORT_MARGIN, Math.min(x, viewport.width - size.width - VIEWPORT_MARGIN)),
    y: Math.max(VIEWPORT_MARGIN, Math.min(y, viewport.height - size.height - VIEWPORT_MARGIN)),
  }
}

function layoutToPhysical(layout: FloatingClockPosition) {
  const viewport = getPhysicalViewport()
  const size = getPhysicalClockSize()
  if (layout.mode !== 'viewport-ratio') {
    return clampPhysicalPosition(layout.x * currentZoom, layout.y * currentZoom)
  }
  const availableWidth = Math.max(0, viewport.width - size.width - VIEWPORT_MARGIN * 2)
  const availableHeight = Math.max(0, viewport.height - size.height - VIEWPORT_MARGIN * 2)
  return clampPhysicalPosition(
    VIEWPORT_MARGIN + Math.max(0, Math.min(1, layout.x)) * availableWidth,
    VIEWPORT_MARGIN + Math.max(0, Math.min(1, layout.y)) * availableHeight
  )
}

function applyLayout(layout: FloatingClockPosition) {
  if (!clockHost) return
  currentLayout = layout
  const position = layoutToPhysical(layout)
  clockHost.style.left = `${position.x / currentZoom}px`
  clockHost.style.top = `${position.y / currentZoom}px`
  clockHost.style.transform = `scale(${1 / currentZoom})`
}

function physicalToLayout(x: number, y: number): FloatingClockPosition {
  const viewport = getPhysicalViewport()
  const size = getPhysicalClockSize()
  const position = clampPhysicalPosition(x, y)
  const availableWidth = Math.max(1, viewport.width - size.width - VIEWPORT_MARGIN * 2)
  const availableHeight = Math.max(1, viewport.height - size.height - VIEWPORT_MARGIN * 2)
  return {
    x: Math.max(0, Math.min(1, (position.x - VIEWPORT_MARGIN) / availableWidth)),
    y: Math.max(0, Math.min(1, (position.y - VIEWPORT_MARGIN) / availableHeight)),
    mode: 'viewport-ratio',
    expanded: true,
  }
}

function getTimeZoneOffset(now: Date, timeZone: string) {
  const values = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now).map((part) => [part.type, part.value]))
  const zonedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  )
  return Math.round((zonedAsUtc - Math.floor(now.getTime() / 1000) * 1000) / 3_600_000)
}

async function showFloatingClock() {
  if (window !== window.top || clockHost || document.getElementById(HOST_ID)) return
  currentZoom = await loadTabZoom()
  currentLayout = {
    ...await loadFloatingClockPosition() || currentLayout,
    expanded: true,
  }

  const host = document.createElement('aside')
  host.id = HOST_ID
  host.style.cssText = [
    'all:initial',
    'position:fixed',
    'left:0',
    'top:0',
    `width:${CLOCK_WIDTH}px`,
    'z-index:2147483646',
    'transform-origin:top left',
    'visibility:hidden',
    'touch-action:none',
    'pointer-events:auto',
  ].join(';')
  const shadow = host.attachShadow({ mode: 'open' })
  shadow.innerHTML = `
    <style>
      :host{color-scheme:dark}*{box-sizing:border-box}
      .clock{position:relative;width:${CLOCK_WIDTH}px;border:1px solid rgba(148,163,184,.22);border-radius:14px;background:linear-gradient(135deg,#080e20 0%,#0f172a 60%,#162035 100%);box-shadow:0 6px 18px rgba(2,6,23,.55),inset 0 1px 0 rgba(255,255,255,.06);color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:grab;user-select:none}.clock:active{cursor:grabbing}
      .row1{display:flex;align-items:center;gap:0;padding:8px 10px 5px}
      .live{width:6px;height:6px;border-radius:50%;background:#34d399;box-shadow:0 0 6px #34d399;flex-shrink:0}
      .madrid-time{font:800 22px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:-.04em;margin-left:8px}
      .zone-pill{margin-left:5px;border-radius:5px;background:rgba(37,71,107,.7);padding:2px 5px;color:#bae6fd;font-size:8.5px;font-weight:800;letter-spacing:.02em;align-self:center}
      .spacer{flex:1}
      .diff-pill{border-radius:5px;background:rgba(99,102,241,.18);border:1px solid rgba(99,102,241,.3);padding:2px 6px;color:#c7d2fe;font-size:8.5px;font-weight:700;white-space:nowrap}
      .menu-btn{border:0;border-radius:5px;background:transparent;padding:2px 4px;color:#64748b;font:700 16px/1 system-ui;cursor:pointer;margin-left:4px;flex-shrink:0}.menu-btn:hover{background:rgba(255,255,255,.08);color:#fff}
      .row2{display:flex;align-items:center;gap:6px;padding:0 10px 7px}
      .date-str{color:#64748b;font-size:9.5px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
      .lima-wrap{display:flex;align-items:center;gap:4px;flex-shrink:0}
      .lima-label{color:#475569;font-size:8.5px;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
      .lima-time{font:700 11px/1 ui-monospace,SFMono-Regular,Consolas,monospace;color:#94a3b8}
      .menu{position:absolute;right:6px;top:36px;display:none;min-width:96px;border:1px solid rgba(148,163,184,.22);border-radius:8px;background:#0f172a;padding:4px;box-shadow:0 8px 20px rgba(2,6,23,.5);z-index:2}.menu.open{display:block}
      .close-btn{width:100%;border:0;border-radius:5px;background:transparent;padding:5px 8px;color:#fca5a5;font:600 9.5px system-ui;text-align:left;cursor:pointer}.close-btn:hover{background:rgba(239,68,68,.12)}
    </style>
    <section class="clock" aria-label="Reloj de España">
      <div class="row1"><i class="live"></i><span class="madrid-time time">--:--:--</span><span class="zone-pill zone">CET</span><span class="spacer"></span><span class="diff-pill">Lima <strong class="difference">+7 h</strong></span><div style="position:relative"><button class="menu-btn" type="button" aria-label="Opciones del reloj" aria-expanded="false">⋮</button><div class="menu"><button class="close-btn" type="button">Desactivar</button></div></div></div>
      <div class="row2"><span class="date-str date"></span><span class="lima-wrap"><span class="lima-label">Lima</span><span class="lima-time mono lima">--:--</span></span></div>
    </section>`

  const drag = shadow.querySelector<HTMLElement>('.clock')
  const time = shadow.querySelector<HTMLElement>('.time')
  const date = shadow.querySelector<HTMLElement>('.date')
  const lima = shadow.querySelector<HTMLElement>('.lima')
  const difference = shadow.querySelector<HTMLElement>('.difference')
  const zone = shadow.querySelector<HTMLElement>('.zone')
  const menuButton = shadow.querySelector<HTMLButtonElement>('.menu-btn')
  const menu = shadow.querySelector<HTMLElement>('.menu')
  if (!drag || !time || !date || !lima || !difference || !zone || !menuButton || !menu) return

  clockHost = host
  document.documentElement.appendChild(host)
  if (currentLayout.mode !== 'viewport-ratio') {
    const legacyPosition = layoutToPhysical(currentLayout)
    currentLayout = physicalToLayout(legacyPosition.x, legacyPosition.y)
    void saveFloatingClockPosition(currentLayout)
  }
  applyLayout(currentLayout)
  host.style.visibility = 'visible'

  const update = () => {
    const now = new Date()
    time.textContent = new Intl.DateTimeFormat('es-PE', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now)
    const formattedDate = new Intl.DateTimeFormat('es-PE', { timeZone: 'Europe/Madrid', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(now).replace(/\./g, '')
    date.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
    lima.textContent = new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false }).format(now)
    const madridParts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', hour12: false, timeZoneName: 'short' }).formatToParts(now)
    zone.textContent = madridParts.find((part) => part.type === 'timeZoneName')?.value || 'Madrid'
    const hourDifference = getTimeZoneOffset(now, 'Europe/Madrid') - getTimeZoneOffset(now, 'America/Lima')
    difference.textContent = `${hourDifference >= 0 ? '+' : ''}${hourDifference} h`
  }

  menuButton.addEventListener('click', (e) => {
    e.stopPropagation()
    const open = menu.classList.toggle('open')
    menuButton.setAttribute('aria-expanded', String(open))
  })

  let dragStart: { pointerX: number; pointerY: number; x: number; y: number } | null = null
  drag.addEventListener('pointerdown', (event) => {
    const physical = layoutToPhysical(currentLayout)
    dragStart = { pointerX: event.clientX, pointerY: event.clientY, x: physical.x, y: physical.y }
    drag.setPointerCapture(event.pointerId)
    event.preventDefault()
  })
  drag.addEventListener('pointermove', (event) => {
    if (!dragStart) return
    const x = dragStart.x + (event.clientX - dragStart.pointerX) * currentZoom
    const y = dragStart.y + (event.clientY - dragStart.pointerY) * currentZoom
    const position = clampPhysicalPosition(x, y)
    host.style.left = `${position.x / currentZoom}px`
    host.style.top = `${position.y / currentZoom}px`
  })
  drag.addEventListener('pointerup', (event) => {
    if (!dragStart) return
    const x = dragStart.x + (event.clientX - dragStart.pointerX) * currentZoom
    const y = dragStart.y + (event.clientY - dragStart.pointerY) * currentZoom
    dragStart = null
    drag.releasePointerCapture(event.pointerId)
    currentLayout = physicalToLayout(x, y)
    applyLayout(currentLayout)
    void saveFloatingClockPosition(currentLayout)
  })

  shadow.querySelector('.close-btn')?.addEventListener('click', () => {
    void setFloatingClockEnabled(false)
    removeFloatingClock()
  })
  update()
  clockTimer = window.setInterval(update, 1000)
}

async function refreshLayout() {
  if (!clockHost) return
  currentZoom = await loadTabZoom()
  applyLayout(currentLayout)
}

async function syncFloatingClock() {
  if (window !== window.top) return
  if (await isFloatingClockEnabled()) await showFloatingClock()
  else removeFloatingClock()
}

void syncFloatingClock()
window.addEventListener('resize', () => { void refreshLayout() })
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return
  if (FLOATING_CLOCK_ENABLED_KEY in changes) {
    if (changes[FLOATING_CLOCK_ENABLED_KEY].newValue === true) void showFloatingClock()
    else removeFloatingClock()
  }
  if (FLOATING_CLOCK_POSITION_KEY in changes && clockHost) {
    const next = changes[FLOATING_CLOCK_POSITION_KEY].newValue as FloatingClockPosition | undefined
    if (next && Number.isFinite(next.x) && Number.isFinite(next.y)) {
      currentLayout = { ...next, expanded: true }
      requestAnimationFrame(() => applyLayout(currentLayout))
    }
  }
})

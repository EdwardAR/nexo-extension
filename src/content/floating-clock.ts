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
const CLOCK_WIDTH = 286
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
    height: clockHost?.offsetHeight || 142,
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
      .clock{width:${CLOCK_WIDTH}px;overflow:hidden;border:1px solid rgba(255,255,255,.2);border-radius:10px;background:radial-gradient(circle at 95% 0%,rgba(34,211,238,.22),transparent 38%),linear-gradient(120deg,#020617 0%,#312e81 64%,#0e7490 100%);box-shadow:0 14px 32px rgba(15,23,42,.35);color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .drag{display:flex;height:22px;align-items:center;justify-content:space-between;padding:3px 9px 1px;color:#a5f3fc;cursor:grab;user-select:none}.drag:active{cursor:grabbing}.brand{display:flex;align-items:center;gap:5px;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.live{width:6px;height:6px;border-radius:50%;background:#34d399;box-shadow:0 0 8px #34d399}.grip{color:rgba(255,255,255,.5);font-size:14px;letter-spacing:1px}
      .main{display:flex;width:100%;align-items:center;gap:8px;padding:3px 10px 8px;color:inherit}.flag{position:relative;display:grid;width:36px;height:36px;flex:none;place-items:center;border:1px solid rgba(255,255,255,.12);border-radius:9px;background:rgba(255,255,255,.1);font-size:18px}.period{position:absolute;right:-3px;bottom:-3px;display:grid;width:16px;height:16px;place-items:center;border-radius:50%;background:#172554;font-size:9px}.copy{min-width:0;flex:1}.city{display:block;color:#a5f3fc;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.time-row{display:flex;align-items:center;gap:7px;margin-top:1px}.time{font:750 22px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:-.04em}.zone{border:1px solid rgba(165,243,252,.2);border-radius:999px;background:rgba(8,145,178,.18);padding:3px 6px;color:#cffafe;font-size:9px;font-weight:800}.date{display:block;margin-top:3px;overflow:hidden;color:#e0e7ff;font-size:11px;font-weight:600;line-height:1.15;text-overflow:ellipsis;text-transform:capitalize;white-space:nowrap}
      .details{display:block;border-top:1px solid rgba(255,255,255,.11);padding:7px 9px 6px;background:rgba(2,6,23,.24)}.info{display:grid;grid-template-columns:1fr 1.12fr 1fr;align-items:center;border:1px solid rgba(255,255,255,.08);border-radius:8px;background:rgba(255,255,255,.055);padding:7px 0}.tile{min-width:0;padding:0 4px;text-align:center}.tile+.tile{border-left:1px solid rgba(255,255,255,.11)}.label{display:block;overflow:hidden;color:#cbd5e1;font-size:10px;font-weight:800;line-height:1.1;text-overflow:ellipsis;white-space:nowrap}.value{display:block;margin-top:3px;color:#fff;font-size:13px;font-weight:800;line-height:1.1;white-space:nowrap}.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:14px}.footer{display:flex;align-items:center;justify-content:space-between;margin-top:4px}.updated{color:#67e8f9;font-size:9px}.close{border:0;border-radius:6px;background:transparent;padding:3px 5px;color:#a5b4c7;font:600 9px inherit;cursor:pointer}.close:hover{background:rgba(248,113,113,.16);color:#fecaca}
    </style>
    <section class="clock" aria-label="Reloj de España">
      <div class="drag" title="Arrastra para mover"><span class="brand"><i class="live"></i>Nexo World Time</span><span class="grip">⠿</span></div>
      <div class="main"><span class="flag">🇪🇸<i class="period">☀️</i></span><span class="copy"><span class="city">Madrid · España</span><span class="time-row"><span class="time">--:--:--</span><span class="zone">CEST</span></span><span class="date"></span></span></div>
      <div class="details"><div class="info"><div class="tile"><span class="label">🇵🇪 Lima</span><strong class="value mono lima">--:--</strong></div><div class="tile"><span class="label">Diferencia</span><strong class="value difference">+7 h</strong></div><div class="tile"><span class="label">Estado</span><strong class="value work">Laboral</strong></div></div><div class="footer"><span class="updated">● En vivo</span><button class="close" type="button">Desactivar</button></div></div>
    </section>`

  const drag = shadow.querySelector<HTMLElement>('.drag')
  const time = shadow.querySelector<HTMLElement>('.time')
  const date = shadow.querySelector<HTMLElement>('.date')
  const lima = shadow.querySelector<HTMLElement>('.lima')
  const difference = shadow.querySelector<HTMLElement>('.difference')
  const zone = shadow.querySelector<HTMLElement>('.zone')
  const work = shadow.querySelector<HTMLElement>('.work')
  const period = shadow.querySelector<HTMLElement>('.period')
  if (!drag || !time || !date || !lima || !difference || !zone || !work || !period) return

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
    date.textContent = new Intl.DateTimeFormat('es-PE', { timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)
    lima.textContent = new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false }).format(now)
    const madridParts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', hour12: false, timeZoneName: 'short' }).formatToParts(now)
    const madridHour = Number(madridParts.find((part) => part.type === 'hour')?.value || 0)
    zone.textContent = madridParts.find((part) => part.type === 'timeZoneName')?.value || 'Madrid'
    const hourDifference = getTimeZoneOffset(now, 'Europe/Madrid') - getTimeZoneOffset(now, 'America/Lima')
    difference.textContent = `${hourDifference >= 0 ? '+' : ''}${hourDifference} h`
    const working = madridHour >= 9 && madridHour < 18
    work.textContent = working ? 'Laboral' : 'No laboral'
    work.style.color = working ? '#6ee7b7' : '#fcd34d'
    period.textContent = madridHour >= 7 && madridHour < 21 ? '☀️' : '🌙'
  }

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

  shadow.querySelector('.close')?.addEventListener('click', () => {
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

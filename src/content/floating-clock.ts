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
const CLOCK_WIDTH = 540
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
      .clock{position:relative;width:${CLOCK_WIDTH}px;overflow:visible;border:1px solid rgba(148,163,184,.32);border-radius:13px;background:radial-gradient(circle at 82% 0%,rgba(49,46,129,.2),transparent 45%),linear-gradient(110deg,#070b1c 0%,#11162e 55%,#17203d 100%);box-shadow:0 12px 28px rgba(2,6,23,.42);color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .drag{display:flex;height:31px;align-items:end;padding:8px 15px 0;cursor:grab;user-select:none}.drag:active{cursor:grabbing}.brand{display:flex;align-items:center;gap:9px;color:#f8fafc;font-size:12px;font-weight:800;letter-spacing:.035em;text-transform:uppercase}.live{width:9px;height:9px;border-radius:50%;background:#34d399;box-shadow:0 0 10px #34d399}
      .content{display:grid;grid-template-columns:44px 1fr 1px 72px 1px 60px 22px;gap:8px;align-items:center;padding:5px 12px 11px}.badge{display:grid;width:44px;height:44px;place-items:center;border:1px solid #d9a514;border-radius:9px;background:rgba(15,23,42,.62);font-size:17px;font-weight:800}.primary{min-width:0}.time-row{display:flex;align-items:center;gap:6px}.time{font:800 26px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:-.045em}.zone{border-radius:8px;background:linear-gradient(180deg,#25476b,#17304c);padding:5px 8px;color:#e0f2fe;font-size:10px;font-weight:800;box-shadow:inset 0 1px rgba(255,255,255,.08)}.date{display:block;margin-top:6px;overflow:hidden;color:#b8c0d4;font-size:11.5px;font-weight:500;line-height:1;text-overflow:ellipsis;white-space:nowrap}.separator{width:1px;height:42px;background:rgba(148,163,184,.3)}.tile{min-width:0}.label{display:block;overflow:hidden;color:#cbd5e1;font-size:10px;font-weight:500;line-height:1.1;text-overflow:ellipsis;white-space:nowrap}.value{display:block;margin-top:6px;color:#f8fafc;font-size:16px;font-weight:800;line-height:1;white-space:nowrap}.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.actions{position:relative;display:grid;place-items:center}.menu-button{border:0;border-radius:7px;background:transparent;padding:3px 7px;color:#9ca3b7;font:800 24px/1 system-ui;cursor:pointer}.menu-button:hover,.menu-button[aria-expanded="true"]{background:rgba(255,255,255,.08);color:#fff}.menu{position:absolute;right:-5px;top:36px;display:none;min-width:92px;border:1px solid rgba(148,163,184,.26);border-radius:8px;background:#111827;padding:4px;box-shadow:0 10px 24px rgba(2,6,23,.45);z-index:2}.menu.open{display:block}.close{width:100%;border:0;border-radius:5px;background:transparent;padding:6px 8px;color:#fecaca;font:600 10px system-ui;text-align:left;cursor:pointer}.close:hover{background:rgba(248,113,113,.14)}
    </style>
    <section class="clock" aria-label="Reloj de España">
      <div class="drag" title="Arrastra para mover"><span class="brand"><i class="live"></i>Madrid - España</span></div>
      <div class="content"><span class="badge">ES</span><div class="primary"><span class="time-row"><span class="time">--:--:--</span><span class="zone">CEST</span></span><span class="date"></span></div><i class="separator"></i><div class="tile"><span class="label">PC Lima</span><strong class="value mono lima">--:--</strong></div><i class="separator"></i><div class="tile"><span class="label">Dif.</span><strong class="value difference">+7 h</strong></div><div class="actions"><button class="menu-button" type="button" aria-label="Opciones del reloj" aria-expanded="false">⋮</button><div class="menu"><button class="close" type="button">Desactivar</button></div></div></div>
    </section>`

  const drag = shadow.querySelector<HTMLElement>('.drag')
  const time = shadow.querySelector<HTMLElement>('.time')
  const date = shadow.querySelector<HTMLElement>('.date')
  const lima = shadow.querySelector<HTMLElement>('.lima')
  const difference = shadow.querySelector<HTMLElement>('.difference')
  const zone = shadow.querySelector<HTMLElement>('.zone')
  const menuButton = shadow.querySelector<HTMLButtonElement>('.menu-button')
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

  menuButton.addEventListener('click', () => {
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

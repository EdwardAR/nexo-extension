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
const CLOCK_WIDTH = 170
const CLOCK_HEIGHT = 44
const VIEWPORT_MARGIN = 10

type ClockTimeZone = 'America/Lima' | 'Europe/Madrid'

interface ClockFormatters {
  madridTime: Intl.DateTimeFormat
  madridDate: Intl.DateTimeFormat
  limaTime: Intl.DateTimeFormat
  madridZone: Intl.DateTimeFormat
  offsets: Record<ClockTimeZone, Intl.DateTimeFormat>
}

let clockHost: HTMLElement | null = null
let clockTimer: number | undefined
let currentZoom = 1
let currentLayout: FloatingClockPosition = {
  x: 1,
  y: 0.12,
  mode: 'viewport-ratio',
  expanded: true,
}
let clockFormatters: ClockFormatters | null = null

function getClockFormatters(): ClockFormatters {
  if (clockFormatters) return clockFormatters

  const offsetOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }

  clockFormatters = {
    madridTime: new Intl.DateTimeFormat('es-PE', {
      timeZone: 'Europe/Madrid',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
    madridDate: new Intl.DateTimeFormat('es-PE', {
      timeZone: 'Europe/Madrid',
      day: '2-digit',
      month: 'short',
    }),
    limaTime: new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    madridZone: new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Madrid',
      hour: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    }),
    offsets: {
      'America/Lima': new Intl.DateTimeFormat('en-CA', {
        ...offsetOptions,
        timeZone: 'America/Lima',
      }),
      'Europe/Madrid': new Intl.DateTimeFormat('en-CA', {
        ...offsetOptions,
        timeZone: 'Europe/Madrid',
      }),
    },
  }

  return clockFormatters
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
    height: clockHost?.offsetHeight || CLOCK_HEIGHT,
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

function getTimeZoneOffset(
  now: Date,
  formatter: Intl.DateTimeFormat
) {
  const values = Object.fromEntries(
    formatter.formatToParts(now).map((part) => [part.type, part.value])
  )
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
      .clock{position:relative;width:${CLOCK_WIDTH}px;height:${CLOCK_HEIGHT}px;border:1px solid rgba(148,163,184,.22);border-radius:9px;background:linear-gradient(135deg,#080e20 0%,#0f172a 60%,#162035 100%);box-shadow:0 4px 12px rgba(2,6,23,.55),inset 0 1px 0 rgba(255,255,255,.06);color:#fff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:grab;user-select:none}.clock:active{cursor:grabbing}
      .clock-grid{display:grid;grid-template-columns:minmax(0,1fr) 50px 11px;column-gap:2px;align-items:stretch;height:100%;padding:4px}
      .madrid-block,.lima-block{display:grid;grid-template-rows:7px minmax(0,1fr) 7px;align-items:center;min-width:0}
      .city-line{display:flex;align-items:center;gap:2px;min-width:0;color:#94a3b8;font-size:6.5px;font-weight:800;letter-spacing:.03em;line-height:1;text-transform:uppercase;white-space:nowrap}
      .live{width:4px;height:4px;border-radius:50%;background:#34d399;box-shadow:0 0 4px #34d399;flex-shrink:0}
      .clock-globe{width:8px;height:8px;display:inline-flex;flex:none}.clock-globe svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      .madrid-time{font:800 17px/1 Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;letter-spacing:-.055em}
      .zone-pill{border-radius:3px;background:rgba(37,71,107,.7);padding:0 2px;color:#bae6fd;font-size:6px;font-weight:800;letter-spacing:0}
      .date-str{min-width:0;overflow:hidden;color:#64748b;font-size:7px;font-weight:600;line-height:1;white-space:nowrap;text-overflow:ellipsis}
      .lima-block{border-left:1px solid rgba(148,163,184,.15);padding-left:4px}
      .lima-time{font:750 12px/1 Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;letter-spacing:-.04em;color:#e2e8f0}
      .difference{color:#a5b4fc;font-size:7px;font-weight:750;line-height:1;white-space:nowrap}
      .menu-wrap{position:relative;display:flex;align-items:flex-start;justify-content:flex-end}
      .menu-btn{border:0;border-radius:4px;background:transparent;padding:0 1px;color:#64748b;font:700 12px/1 Inter,ui-sans-serif,system-ui;cursor:pointer;flex-shrink:0}.menu-btn:hover{background:rgba(255,255,255,.08);color:#fff}.menu-icon{width:12px;height:12px;display:block;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .menu{position:absolute;right:-2px;top:16px;display:none;min-width:90px;border:1px solid rgba(148,163,184,.22);border-radius:8px;background:#0f172a;padding:4px;box-shadow:0 8px 20px rgba(2,6,23,.5);z-index:2}.menu.open{display:block}
      .close-btn{width:100%;border:0;border-radius:5px;background:transparent;padding:5px 8px;color:#fca5a5;font:600 9.5px Inter,ui-sans-serif,system-ui;text-align:left;cursor:pointer}.close-btn:hover{background:rgba(239,68,68,.12)}
    </style>
    <section class="clock" aria-label="Reloj de España y Perú">
      <div class="clock-grid">
        <div class="madrid-block">
          <div class="city-line"><i class="live"></i><span class="clock-globe" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/></svg></span><span>Madrid</span><span class="zone-pill zone">CET</span></div>
          <strong class="madrid-time time">--:--:--</strong>
          <span class="date-str date"></span>
        </div>
        <div class="lima-block">
          <div class="city-line"><span class="clock-globe" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/></svg></span><span>Lima</span></div>
          <strong class="lima-time lima">--:--</strong>
          <span class="difference">−7 h</span>
        </div>
        <div class="menu-wrap"><button class="menu-btn" type="button" aria-label="Opciones del reloj" aria-expanded="false"><svg class="menu-icon" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg></button><div class="menu"><button class="close-btn" type="button">Desactivar</button></div></div>
      </div>
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
  const formatters = getClockFormatters()

  const update = () => {
    const now = new Date()
    time.textContent = formatters.madridTime.format(now)
    const formattedDate = formatters.madridDate.format(now).replace(/\./g, '')
    date.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
    lima.textContent = formatters.limaTime.format(now)
    const madridParts = formatters.madridZone.formatToParts(now)
    zone.textContent = madridParts.find((part) => part.type === 'timeZoneName')?.value || 'Madrid'
    const limaDifference = getTimeZoneOffset(now, formatters.offsets['America/Lima']) - getTimeZoneOffset(now, formatters.offsets['Europe/Madrid'])
    const differenceSign = limaDifference > 0 ? '+' : limaDifference < 0 ? '−' : ''
    difference.textContent = `${differenceSign}${Math.abs(limaDifference)} h`
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

import {
  FLOATING_CLOCK_ENABLED_KEY,
  FLOATING_CLOCK_POSITION_KEY,
  FLOATING_CLOCK_SETTINGS_KEY,
  isFloatingClockEnabled,
  loadFloatingClockPosition,
  loadFloatingClockSettings,
  saveFloatingClockPosition,
  saveFloatingClockSettings,
  setFloatingClockEnabled,
  type FloatingClockPosition,
  type FloatingClockSettings,
} from '../shared/floating-clock'
import {
  TIME_ZONE_CONFIGS,
  type ReminderTimeZone,
  type TimeZoneConfig,
} from '../shared/timezones'

const HOST_ID = 'nexo-floating-clock-host'
const VIEWPORT_MARGIN = 10
const DEFAULT_CLOCK_SIZE = { width: 260, height: 76 }

interface ClockZoneFormatters {
  time: Intl.DateTimeFormat
  date: Intl.DateTimeFormat
  zone: Intl.DateTimeFormat
  offset: Intl.DateTimeFormat
}

interface ClockFormatters {
  zones: Record<ReminderTimeZone, ClockZoneFormatters>
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

function getClockDimensions(cityCount: number) {
  if (cityCount === 1) return { width: 200, height: 76 }
  if (cityCount === 2) return { width: 270, height: 76 }
  return { width: 350, height: 80 }
}

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

  const zones = Object.fromEntries(TIME_ZONE_CONFIGS.map((zone) => [zone.id, {
    time: new Intl.DateTimeFormat(zone.locale, {
      timeZone: zone.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    date: new Intl.DateTimeFormat(zone.locale, {
      timeZone: zone.timeZone,
      day: '2-digit',
      month: 'short',
    }),
    zone: new Intl.DateTimeFormat('en-GB', {
      timeZone: zone.timeZone,
      hour: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    }),
    offset: new Intl.DateTimeFormat('en-CA', {
      ...offsetOptions,
      timeZone: zone.timeZone,
    }),
  }])) as Record<ReminderTimeZone, ClockZoneFormatters>

  clockFormatters = { zones }
  return clockFormatters
}

function getOrderedZones(settings: FloatingClockSettings): TimeZoneConfig[] {
  const selected = settings.cities
    .map((id) => TIME_ZONE_CONFIGS.find((zone) => zone.id === id))
    .filter((zone): zone is TimeZoneConfig => Boolean(zone))
  const primary = selected.find((zone) => zone.id === settings.primary) || selected[0]
  return primary ? [primary, ...selected.filter((zone) => zone.id !== primary.id)] : [TIME_ZONE_CONFIGS[0]]
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
    width: clockHost?.offsetWidth || DEFAULT_CLOCK_SIZE.width,
    height: clockHost?.offsetHeight || DEFAULT_CLOCK_SIZE.height,
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

function getTimeZoneOffset(now: Date, formatter: Intl.DateTimeFormat) {
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

function formatDate(formatter: Intl.DateTimeFormat, now: Date) {
  const value = formatter.format(now).replace(/\./g, '')
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatDifference(
  now: Date,
  zone: TimeZoneConfig,
  primary: TimeZoneConfig,
  formatters: ClockFormatters
) {
  if (zone.id === primary.id) return 'Referencia'
  const difference = getTimeZoneOffset(now, formatters.zones[zone.id].offset) - getTimeZoneOffset(now, formatters.zones[primary.id].offset)
  if (difference === 0) return `= ${primary.city}`
  const sign = difference > 0 ? '+' : '−'
  return `${sign}${Math.abs(difference)} h ${primary.city}`
}

function globeMarkup() {
  return '<span class="clock-globe" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/></svg></span>'
}

function cityBlockMarkup(zone: TimeZoneConfig) {
  return `<article class="city-block" data-zone-id="${zone.id}" aria-label="Hora de ${zone.city}">
    <div class="city-line">${globeMarkup()}<span class="city-name">${zone.city}</span><span class="zone-pill" data-zone-label>--</span></div>
    <strong class="city-time" data-time>--:--</strong>
    <span class="city-context" data-context><span data-date>--</span><span aria-hidden="true">·</span><span data-difference>Referencia</span></span>
  </article>`
}

function settingsMenuMarkup(settings: FloatingClockSettings) {
  const cityButtons = TIME_ZONE_CONFIGS.map((zone) => {
    const selected = settings.cities.includes(zone.id)
    return `<button class="city-toggle${selected ? ' selected' : ''}" type="button" data-city-toggle="${zone.id}" aria-pressed="${selected}"><span>${zone.city}</span><span class="city-toggle-state">${selected ? 'Visible' : 'Oculta'}</span></button>`
  }).join('')
  const primaryOptions = TIME_ZONE_CONFIGS
    .filter((zone) => settings.cities.includes(zone.id))
    .map((zone) => `<option value="${zone.id}"${zone.id === settings.primary ? ' selected' : ''}>${zone.city}</option>`)
    .join('')
  return `<div class="menu" role="dialog" aria-label="Configurar reloj flotante">
    <span class="menu-label">Ciudades visibles</span>
    <div class="city-options">${cityButtons}</div>
    <label class="primary-label"><span>Ciudad principal</span><select data-primary-select>${primaryOptions}</select></label>
    <button class="close-btn" type="button">Desactivar reloj</button>
  </div>`
}

async function refreshFloatingClockSettings(nextSettings: FloatingClockSettings) {
  await saveFloatingClockSettings(nextSettings)
  removeFloatingClock()
  await syncFloatingClock()
}

async function showFloatingClock() {
  if (window !== window.top || clockHost || document.getElementById(HOST_ID)) return
  currentZoom = await loadTabZoom()
  const settings = await loadFloatingClockSettings()
  const visibleZones = getOrderedZones(settings)
  const primary = visibleZones.find((zone) => zone.id === settings.primary) || visibleZones[0]
  const dimensions = getClockDimensions(visibleZones.length)
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
    `width:${dimensions.width}px`,
    `max-width:calc(100vw - ${VIEWPORT_MARGIN * 2}px)`,
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
      .clock{position:relative;width:100%;min-height:${dimensions.height}px;border:1px solid rgba(148,163,184,.25);border-radius:13px;background:linear-gradient(135deg,#0d1735 0%,#111d43 58%,#17275a 100%);box-shadow:0 8px 22px rgba(2,6,23,.42),inset 0 1px 0 rgba(255,255,255,.07);color:#fff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:grab;user-select:none}
      .clock:active{cursor:grabbing}.clock-toolbar{display:flex;align-items:center;justify-content:space-between;height:25px;padding:5px 8px 0;color:#94a3b8}.live-label{display:flex;align-items:center;gap:5px;font-size:8px;font-weight:800;letter-spacing:.1em;line-height:1;text-transform:uppercase}.live{width:5px;height:5px;border-radius:50%;background:#34d399;box-shadow:0 0 5px #34d399;flex-shrink:0}
      .clock-grid{display:grid;align-items:stretch;gap:0;padding:6px 9px 9px}.clock[data-count="1"] .clock-grid{grid-template-columns:minmax(0,1fr)}.clock[data-count="2"] .clock-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.clock[data-count="3"] .clock-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.city-block{display:grid;grid-template-rows:16px 25px 13px minmax(22px,auto);align-items:center;min-width:0;padding:0 6px;text-align:center}.city-block+.city-block{border-left:1px solid rgba(148,163,184,.18)}
      .city-line{display:flex;align-items:center;justify-content:center;gap:4px;min-width:0;color:#cbd5e1;font-size:10px;font-weight:700;letter-spacing:.01em;line-height:1;white-space:nowrap}.city-name{min-width:0;white-space:nowrap}.clock-globe{width:11px;height:11px;display:inline-flex;flex:none}.clock-globe svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.zone-pill{border-radius:4px;background:rgba(56,189,248,.14);padding:2px 4px;color:#bae6fd;font-size:8px;font-weight:800;line-height:1;white-space:nowrap}.city-time{display:block;color:#fff;font:750 21px/1 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-variant-numeric:tabular-nums;letter-spacing:-.045em;white-space:nowrap}.date-str{display:block;min-width:0;overflow:hidden;color:#94a3b8;font-size:9px;font-weight:600;line-height:1;white-space:nowrap;text-overflow:ellipsis}.difference{display:flex;align-items:center;justify-content:center;min-width:0;color:#a5b4fc;font-size:10px;font-weight:600;line-height:1.15;text-align:center}.clock[data-count="3"] .city-time{font-size:18px}.clock[data-count="3"] .city-block{padding:0 4px}.clock[data-count="3"] .difference{font-size:9px}
      .menu-wrap{position:relative;display:flex;align-items:center}.menu-btn{display:flex;align-items:center;justify-content:center;width:34px;height:32px;border:0;border-radius:8px;background:transparent;padding:0;color:#94a3b8;font:700 12px/1 Inter,ui-sans-serif,system-ui;cursor:pointer;flex-shrink:0}.menu-btn:hover,.menu-btn[aria-expanded="true"]{background:rgba(255,255,255,.09);color:#fff}.menu-btn:focus-visible,.city-toggle:focus-visible,.primary-label select:focus-visible,.close-btn:focus-visible{outline:2px solid #67e8f9;outline-offset:2px}.menu-icon{width:16px;height:16px;display:block;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .menu{position:absolute;right:0;top:30px;display:none;width:185px;border:1px solid rgba(148,163,184,.28);border-radius:11px;background:#0e1836;padding:9px;box-shadow:0 12px 28px rgba(2,6,23,.55);z-index:3}.menu.open{display:block}.menu-label,.primary-label>span{display:block;color:#cbd5e1;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.city-options{display:grid;gap:4px;margin-top:6px}.city-toggle{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;border:1px solid transparent;border-radius:7px;background:transparent;padding:7px 8px;color:#aab6d2;font:600 10px Inter,ui-sans-serif,system-ui;text-align:left;cursor:pointer}.city-toggle:hover{background:rgba(255,255,255,.07);color:#fff}.city-toggle.selected{border-color:rgba(103,232,249,.2);background:rgba(56,189,248,.12);color:#fff}.city-toggle-state{color:#64748b;font-size:8px;font-weight:700}.city-toggle.selected .city-toggle-state{color:#67e8f9}.primary-label{display:block;margin-top:10px}.primary-label select{width:100%;margin-top:5px;border:1px solid rgba(148,163,184,.24);border-radius:7px;background:#111d43;padding:7px 8px;color:#fff;font:600 10px Inter,ui-sans-serif,system-ui;cursor:pointer}.close-btn{width:100%;margin-top:9px;border:1px solid rgba(248,113,113,.16);border-radius:7px;background:transparent;padding:7px 8px;color:#fca5a5;font:600 10px Inter,ui-sans-serif,system-ui;text-align:left;cursor:pointer}.close-btn:hover{background:rgba(239,68,68,.12)}
      @media (max-width:360px){.clock[data-count="3"]{min-height:128px}.clock[data-count="3"] .clock-grid{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:6px}.clock[data-count="3"] .city-block:last-child{grid-column:1/-1;width:50%;justify-self:center;border-top:1px solid rgba(148,163,184,.18);border-left:0;padding-top:6px}}
      .clock{height:auto;max-height:62px;min-height:0;overflow:hidden;padding:3px 6px 4px;border-radius:8px;box-shadow:0 2px 8px rgba(2,6,23,.25),inset 0 1px 0 rgba(255,255,255,.06)}
      .clock-toolbar{position:relative;display:flex;align-items:center;justify-content:flex-start;height:10px;margin:0 0 1px;padding:0}.live-label{gap:3px;font-size:7px;line-height:1}.live{width:5px;height:5px}
      .clock-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:0;height:auto;padding:0}.clock[data-count="1"] .clock-grid{grid-template-columns:minmax(0,1fr)}.clock[data-count="3"] .clock-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
      .city-block{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:0;min-width:0;padding:0 5px;text-align:center}.city-block+.city-block{border-left:0}.city-block+.city-block::before{position:absolute;top:50%;left:0;width:1px;height:31px;background:rgba(186,230,253,.2);content:"";transform:translateY(-50%)}
      .city-line{display:flex;align-items:center;justify-content:center;gap:2px;min-width:0;margin:0;color:#cbd5e1;font-size:9px;font-weight:700;line-height:1;white-space:nowrap}.city-name{min-width:0;white-space:nowrap}.clock-globe{width:8px;height:8px}.zone-pill{border-radius:3px;padding:1px 2px;font-size:7px;line-height:1}.city-time{display:block;margin:1px 0 0;color:#fff;font-size:16px;font-weight:700;line-height:.95;font-variant-numeric:tabular-nums;letter-spacing:-.035em;white-space:nowrap}.city-context{display:flex;align-items:center;justify-content:center;gap:3px;min-width:0;margin-top:1px;color:#a5b4fc;font-size:8px;font-weight:600;line-height:1;white-space:nowrap}.city-context [data-date]{color:#94a3b8}.city-context [data-difference]{color:inherit}.clock[data-count="3"] .city-time{font-size:16px}.clock[data-count="3"] .city-block{padding:0 5px}.clock[data-count="3"] .city-context{font-size:7.5px}
      .menu-wrap{position:absolute;top:-7px;right:0;width:24px;height:24px}.menu-btn{width:24px;height:24px}.menu-icon{width:11px;height:11px}
      .menu{top:26px}
      @media (max-width:360px){.clock[data-count="3"]{height:auto;max-height:62px;min-height:0}.clock[data-count="3"] .clock-grid{grid-template-columns:repeat(3,minmax(0,1fr));row-gap:0}.clock[data-count="3"] .city-block:last-child{grid-column:auto;width:auto;border-top:0;border-left:0;padding-top:0}.clock[data-count="3"] .city-block:last-child::before{display:block}}
    </style>
    <section class="clock" data-count="${visibleZones.length}" aria-label="Reloj flotante de ${visibleZones.map((zone) => zone.city).join(', ')}">
      <div class="clock-toolbar"><span class="live-label"><i class="live"></i> En vivo</span><div class="menu-wrap"><button class="menu-btn" type="button" aria-label="Configurar reloj flotante" title="Configurar reloj flotante" aria-expanded="false"><svg class="menu-icon" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>${settingsMenuMarkup(settings)}</div></div>
      <div class="clock-grid">${visibleZones.map(cityBlockMarkup).join('')}</div>
    </section>`

  const drag = shadow.querySelector<HTMLElement>('.clock')
  const menuButton = shadow.querySelector<HTMLButtonElement>('.menu-btn')
  const menu = shadow.querySelector<HTMLElement>('.menu')
  const closeButton = shadow.querySelector<HTMLButtonElement>('.close-btn')
  const primarySelect = shadow.querySelector<HTMLSelectElement>('[data-primary-select]')
  if (!drag || !menuButton || !menu || !closeButton || !primarySelect || !primary) return

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
    visibleZones.forEach((zone) => {
      const block = shadow.querySelector<HTMLElement>(`[data-zone-id="${zone.id}"]`)
      if (!block) return
      const zoneFormatters = formatters.zones[zone.id]
      const time = block.querySelector<HTMLElement>('[data-time]')
      const date = block.querySelector<HTMLElement>('[data-date]')
      const zoneLabel = block.querySelector<HTMLElement>('[data-zone-label]')
      const difference = block.querySelector<HTMLElement>('[data-difference]')
      if (time) time.textContent = zoneFormatters.time.format(now)
      if (date) date.textContent = formatDate(zoneFormatters.date, now)
      if (zoneLabel) zoneLabel.textContent = zoneFormatters.zone.formatToParts(now).find((part) => part.type === 'timeZoneName')?.value || zone.city
      if (difference) difference.textContent = formatDifference(now, zone, primary, formatters)
    })
  }

  menuButton.addEventListener('click', (event) => {
    event.stopPropagation()
    const open = menu.classList.toggle('open')
    menuButton.setAttribute('aria-expanded', String(open))
  })
  menuButton.addEventListener('pointerdown', (event) => event.stopPropagation())
  menu.addEventListener('pointerdown', (event) => event.stopPropagation())

  shadow.querySelectorAll<HTMLButtonElement>('[data-city-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const city = button.dataset.cityToggle as ReminderTimeZone | undefined
      if (!city) return
      const visible = settings.cities.includes(city)
      if (visible && settings.cities.length === 1) return
      const cities = visible ? settings.cities.filter((item) => item !== city) : [...settings.cities, city]
      void refreshFloatingClockSettings({
        cities,
        primary: cities.includes(settings.primary) ? settings.primary : cities[0],
      })
    })
  })

  primarySelect.addEventListener('change', () => {
    void refreshFloatingClockSettings({ ...settings, primary: primarySelect.value as ReminderTimeZone })
  })
  closeButton.addEventListener('click', () => {
    void setFloatingClockEnabled(false)
    removeFloatingClock()
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
  if (FLOATING_CLOCK_SETTINGS_KEY in changes) {
    removeFloatingClock()
    void syncFloatingClock()
  }
  if (FLOATING_CLOCK_POSITION_KEY in changes && clockHost) {
    const next = changes[FLOATING_CLOCK_POSITION_KEY].newValue as FloatingClockPosition | undefined
    if (next && Number.isFinite(next.x) && Number.isFinite(next.y)) {
      currentLayout = { ...next, expanded: true }
      requestAnimationFrame(() => applyLayout(currentLayout))
    }
  }
})

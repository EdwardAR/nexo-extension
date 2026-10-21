import {
  TIME_ZONE_CONFIGS,
  type ReminderTimeZone,
} from './timezones'

export const FLOATING_CLOCK_ENABLED_KEY = 'floating_clock_enabled'
export const FLOATING_CLOCK_POSITION_KEY = 'floating_clock_position'
export const FLOATING_CLOCK_SETTINGS_KEY = 'floating_clock_settings'

export interface FloatingClockSettings {
  cities: ReminderTimeZone[]
  primary: ReminderTimeZone
}

export const DEFAULT_FLOATING_CLOCK_SETTINGS: FloatingClockSettings = {
  cities: ['Europe/Madrid', 'America/Lima'],
  primary: 'Europe/Madrid',
}

export interface FloatingClockPosition {
  x: number
  y: number
  mode?: 'viewport-ratio'
  expanded?: boolean
}

export async function isFloatingClockEnabled() {
  const result = await chrome.storage.local.get(FLOATING_CLOCK_ENABLED_KEY)
  return result[FLOATING_CLOCK_ENABLED_KEY] === true
}

export async function setFloatingClockEnabled(enabled: boolean) {
  await chrome.storage.local.set({ [FLOATING_CLOCK_ENABLED_KEY]: enabled })
}

function isTimeZone(value: unknown): value is ReminderTimeZone {
  return TIME_ZONE_CONFIGS.some((zone) => zone.id === value)
}

function normalizeFloatingClockSettings(value: unknown): FloatingClockSettings {
  if (!value || typeof value !== 'object') return { ...DEFAULT_FLOATING_CLOCK_SETTINGS, cities: [...DEFAULT_FLOATING_CLOCK_SETTINGS.cities] }
  const candidate = value as Partial<FloatingClockSettings>
  const cities = Array.isArray(candidate.cities)
    ? candidate.cities.filter(isTimeZone).filter((city, index, all) => all.indexOf(city) === index).slice(0, TIME_ZONE_CONFIGS.length)
    : []
  const safeCities = cities.length > 0 ? cities : [...DEFAULT_FLOATING_CLOCK_SETTINGS.cities]
  const primary = isTimeZone(candidate.primary) && safeCities.includes(candidate.primary)
    ? candidate.primary
    : safeCities[0]
  return { cities: safeCities, primary }
}

export async function loadFloatingClockSettings(): Promise<FloatingClockSettings> {
  const result = await chrome.storage.local.get(FLOATING_CLOCK_SETTINGS_KEY)
  return normalizeFloatingClockSettings(result[FLOATING_CLOCK_SETTINGS_KEY])
}

export async function saveFloatingClockSettings(settings: FloatingClockSettings): Promise<FloatingClockSettings> {
  const normalized = normalizeFloatingClockSettings(settings)
  await chrome.storage.local.set({ [FLOATING_CLOCK_SETTINGS_KEY]: normalized })
  return normalized
}

export async function loadFloatingClockPosition(): Promise<FloatingClockPosition | null> {
  const result = await chrome.storage.local.get(FLOATING_CLOCK_POSITION_KEY)
  const position = result[FLOATING_CLOCK_POSITION_KEY] as Partial<FloatingClockPosition> | undefined
  return position && Number.isFinite(position.x) && Number.isFinite(position.y)
    ? {
      x: Number(position.x),
      y: Number(position.y),
      mode: position.mode === 'viewport-ratio' ? 'viewport-ratio' : undefined,
      expanded: position.expanded === true,
    }
    : null
}

export async function saveFloatingClockPosition(position: FloatingClockPosition) {
  await chrome.storage.local.set({ [FLOATING_CLOCK_POSITION_KEY]: position })
}

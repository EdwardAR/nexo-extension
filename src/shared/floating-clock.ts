export const FLOATING_CLOCK_ENABLED_KEY = 'floating_clock_enabled'
export const FLOATING_CLOCK_POSITION_KEY = 'floating_clock_position'

export interface FloatingClockPosition {
  x: number
  y: number
}

export async function isFloatingClockEnabled() {
  const result = await chrome.storage.local.get(FLOATING_CLOCK_ENABLED_KEY)
  return result[FLOATING_CLOCK_ENABLED_KEY] === true
}

export async function setFloatingClockEnabled(enabled: boolean) {
  await chrome.storage.local.set({ [FLOATING_CLOCK_ENABLED_KEY]: enabled })
}

export async function loadFloatingClockPosition(): Promise<FloatingClockPosition | null> {
  const result = await chrome.storage.local.get(FLOATING_CLOCK_POSITION_KEY)
  const position = result[FLOATING_CLOCK_POSITION_KEY] as Partial<FloatingClockPosition> | undefined
  return position && Number.isFinite(position.x) && Number.isFinite(position.y)
    ? { x: Number(position.x), y: Number(position.y) }
    : null
}

export async function saveFloatingClockPosition(position: FloatingClockPosition) {
  await chrome.storage.local.set({ [FLOATING_CLOCK_POSITION_KEY]: position })
}

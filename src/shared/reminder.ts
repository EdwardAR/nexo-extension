export const REMINDERS_KEY = 'scheduled_reminders'
export const REMINDER_ALARM_PREFIX = 'nexo-reminder:'

export type ReminderTimeZone = 'America/Lima' | 'Europe/Madrid'

export interface ScheduledReminder {
  id: string
  title: string
  message: string
  scheduledAt: number
  timeZone?: ReminderTimeZone
  enabled: boolean
  createdAt: number
  notifiedAt?: number
}

function dateTimeParts(timestamp: number, timeZone: ReminderTimeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(timestamp)
  return Object.fromEntries(parts.map((part) => [part.type, part.value]))
}

export function timestampToZonedInput(timestamp: number, timeZone: ReminderTimeZone) {
  const parts = dateTimeParts(timestamp, timeZone)
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}

export function zonedInputToTimestamp(value: string, timeZone: ReminderTimeZone) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) return Number.NaN
  const [, year, month, day, hour, minute] = match.map(Number)
  const intended = Date.UTC(year, month - 1, day, hour, minute)
  let timestamp = intended

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const rendered = dateTimeParts(timestamp, timeZone)
    const renderedAsUtc = Date.UTC(
      Number(rendered.year),
      Number(rendered.month) - 1,
      Number(rendered.day),
      Number(rendered.hour),
      Number(rendered.minute)
    )
    timestamp += intended - renderedAsUtc
  }

  return timestampToZonedInput(timestamp, timeZone) === value ? timestamp : Number.NaN
}

export async function loadReminders(): Promise<ScheduledReminder[]> {
  const result = await chrome.storage.local.get(REMINDERS_KEY)
  return Array.isArray(result[REMINDERS_KEY])
    ? result[REMINDERS_KEY] as ScheduledReminder[]
    : []
}

export async function saveReminders(reminders: ScheduledReminder[]) {
  await chrome.storage.local.set({ [REMINDERS_KEY]: reminders })
}

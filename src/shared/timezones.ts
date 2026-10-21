export const TIME_ZONE_CONFIGS = [
  {
    id: 'America/Lima',
    country: 'Perú',
    city: 'Lima',
    timeZone: 'America/Lima',
    locale: 'es-PE',
    accent: 'bg-red-400',
  },
  {
    id: 'Europe/Madrid',
    country: 'España',
    city: 'Madrid',
    timeZone: 'Europe/Madrid',
    locale: 'es-PE',
    accent: 'bg-amber-300',
  },
  {
    id: 'Africa/Casablanca',
    country: 'Marruecos',
    city: 'Casablanca',
    timeZone: 'Africa/Casablanca',
    locale: 'es-PE',
    accent: 'bg-cyan-300',
  },
] as const

export type ReminderTimeZone = typeof TIME_ZONE_CONFIGS[number]['id']
export type TimeZoneConfig = typeof TIME_ZONE_CONFIGS[number]

export function isReminderTimeZone(value: unknown): value is ReminderTimeZone {
  return TIME_ZONE_CONFIGS.some((zone) => zone.id === value)
}

export function getTimeZoneConfig(timeZone: ReminderTimeZone): TimeZoneConfig | undefined {
  return TIME_ZONE_CONFIGS.find((zone) => zone.id === timeZone)
}

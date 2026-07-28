import type { PasswordEntry } from '../popup/types'

export type RenewalStatus = 'unconfigured' | 'overdue' | 'due-soon' | 'current'

export interface RenewalInfo {
  status: RenewalStatus
  dueOn?: string
  daysRemaining?: number
}

export const DEFAULT_RENEWAL_MONTHS = 3
export const RENEWAL_WARNING_DAYS = 7

export function toLocalDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return { year, month, day }
}

export function addCalendarMonths(date: string, months: number) {
  const { year, month, day } = parseDate(date)
  const target = new Date(year, month - 1 + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(day, lastDay))
  return toLocalDateString(target)
}

export function differenceInDays(later: string, earlier = toLocalDateString()) {
  const toUtc = (value: string) => {
    const { year, month, day } = parseDate(value)
    return Date.UTC(year, month - 1, day)
  }
  return Math.round((toUtc(later) - toUtc(earlier)) / 86_400_000)
}

export function getRenewalInfo(entry: PasswordEntry): RenewalInfo {
  if (!entry.passwordChangedOn) return { status: 'unconfigured' }

  const months = entry.renewalIntervalMonths || DEFAULT_RENEWAL_MONTHS
  const dueOn = addCalendarMonths(entry.passwordChangedOn, months)
  const daysRemaining = differenceInDays(dueOn)

  if (daysRemaining <= 0) return { status: 'overdue', dueOn, daysRemaining }
  if (daysRemaining <= RENEWAL_WARNING_DAYS) {
    return { status: 'due-soon', dueOn, daysRemaining }
  }
  return { status: 'current', dueOn, daysRemaining }
}

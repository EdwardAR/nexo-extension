import { FormEvent, useEffect, useMemo, useState } from 'react'
import { AlarmClock, ArrowLeft, Bell, BellOff, Clock3, Globe2, LoaderCircle, Plus, Trash2 } from 'lucide-react'
import {
  timestampToZonedInput,
  zonedInputToTimestamp,
  type ReminderTimeZone,
  type ScheduledReminder,
} from '../../shared/reminder'
import { useReminders } from '../hooks/useReminders'
import { IconButton } from './IconButton'

interface TimePanelProps {
  onClose: () => void
  onToast: (message: string, type: 'success' | 'error' | 'info') => void
}

interface ZoneClockProps {
  city: string
  country: string
  flag: string
  zone: string
  now: Date
  accent: string
}

const zones: Array<{ id: ReminderTimeZone; country: string; city: string; flag: string }> = [
  { id: 'America/Lima', country: 'Perú', city: 'Lima', flag: '🇵🇪' },
  { id: 'Europe/Madrid', country: 'España', city: 'Madrid', flag: '🇪🇸' },
]

function defaultTimestamp() {
  const date = new Date(Date.now() + 60 * 60 * 1000)
  date.setMinutes(Math.ceil(date.getMinutes() / 5) * 5, 0, 0)
  return date.getTime()
}

function formatReminderTime(timestamp: number, timeZone: ReminderTimeZone) {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp)
}

function ZoneClock({ city, country, flag, zone, now, accent }: ZoneClockProps) {
  const time = useMemo(() => new Intl.DateTimeFormat('es-PE', {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now), [now, zone])
  const date = useMemo(() => new Intl.DateTimeFormat('es-PE', {
    timeZone: zone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(now), [now, zone])
  const zoneName = useMemo(() => new Intl.DateTimeFormat('es-PE', {
    timeZone: zone,
    timeZoneName: 'short',
  }).formatToParts(now).find((part) => part.type === 'timeZoneName')?.value, [now, zone])

  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-3 text-white backdrop-blur">
      <span className={`absolute -right-4 -top-5 h-14 w-14 rounded-full ${accent} opacity-40 blur-xl`} />
      <div className="flex items-center justify-between text-[11px] text-white/70">
        <span>{flag} {country}</span>
        <span>{zoneName}</span>
      </div>
      <strong className="mt-1 block font-mono text-[22px] leading-none tracking-tight">{time}</strong>
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className="font-semibold">{city}</span>
        <span className="capitalize text-white/65">{date}</span>
      </div>
    </article>
  )
}

export function TimePanel({ onClose, onToast }: TimePanelProps) {
  const { reminders, loading, save, remove } = useReminders()
  const [now, setNow] = useState(() => new Date())
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [timeZone, setTimeZone] = useState<ReminderTimeZone>('America/Lima')
  const [scheduledAt, setScheduledAt] = useState(() => timestampToZonedInput(defaultTimestamp(), 'America/Lima'))
  const [busy, setBusy] = useState('')

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const upcoming = reminders.filter((reminder) => reminder.enabled && reminder.scheduledAt > Date.now()).length

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const when = zonedInputToTimestamp(scheduledAt, timeZone)
    if (!title.trim() || !Number.isFinite(when) || when <= Date.now()) {
      onToast('Escribe un título y elige una fecha futura', 'error')
      return
    }
    try {
      setBusy('new')
      const reminder: ScheduledReminder = {
        id: crypto.randomUUID(),
        title: title.trim(),
        message: message.trim(),
        scheduledAt: when,
        timeZone,
        enabled: true,
        createdAt: Date.now(),
      }
      await save(reminder)
      setTitle('')
      setMessage('')
      setScheduledAt(timestampToZonedInput(defaultTimestamp(), timeZone))
      onToast('Recordatorio programado', 'success')
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'No se pudo programar', 'error')
    } finally {
      setBusy('')
    }
  }

  const changeTimeZone = (nextTimeZone: ReminderTimeZone) => {
    if (nextTimeZone === timeZone) return
    const currentTimestamp = zonedInputToTimestamp(scheduledAt, timeZone)
    setTimeZone(nextTimeZone)
    setScheduledAt(timestampToZonedInput(
      Number.isFinite(currentTimestamp) ? currentTimestamp : defaultTimestamp(),
      nextTimeZone
    ))
  }

  const selectedTimestamp = zonedInputToTimestamp(scheduledAt, timeZone)
  const alternateZone = timeZone === 'America/Lima' ? 'Europe/Madrid' : 'America/Lima'
  const alternateCity = alternateZone === 'America/Lima' ? 'Lima' : 'Madrid'

  const toggle = async (reminder: ScheduledReminder) => {
    if (!reminder.enabled && reminder.scheduledAt <= Date.now()) {
      onToast('La fecha ya pasó; crea un recordatorio nuevo', 'error')
      return
    }
    try {
      setBusy(reminder.id)
      await save({ ...reminder, enabled: !reminder.enabled, notifiedAt: undefined })
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'No se pudo actualizar', 'error')
    } finally {
      setBusy('')
    }
  }

  const deleteReminder = async (reminder: ScheduledReminder) => {
    try {
      setBusy(reminder.id)
      await remove(reminder.id)
      onToast('Recordatorio eliminado', 'info')
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'No se pudo eliminar', 'error')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-vault-900 to-cyan-900 px-4 pb-5 pt-4">
        <div className="mb-4 flex items-center gap-3 text-white">
          <IconButton label="Volver" onClick={onClose} tone="inverse"><ArrowLeft className="h-4 w-4" /></IconButton>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><Clock3 className="h-5 w-5" /></span>
          <div>
            <h1 className="text-base font-bold">Horarios y alertas</h1>
            <p className="text-xs text-cyan-100/80">Lima y Madrid en tiempo real</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ZoneClock city="Lima" country="Perú" flag="🇵🇪" zone="America/Lima" now={now} accent="bg-red-400" />
          <ZoneClock city="Madrid" country="España" flag="🇪🇸" zone="Europe/Madrid" now={now} accent="bg-amber-300" />
        </div>
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto p-4">
        <form onSubmit={submit} className="card space-y-3 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-vault-50 text-vault-600 dark:bg-vault-950 dark:text-vault-300"><AlarmClock className="h-4 w-4" /></span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Nuevo recordatorio</h2>
              <p className="text-[11px] text-slate-500">Elige en qué país defines la hora</p>
            </div>
          </div>
          <fieldset>
            <legend className="mb-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">Horario de referencia</legend>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-950/60">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => changeTimeZone(zone.id)}
                  className={`rounded-lg px-3 py-2 text-left transition ${timeZone === zone.id
                    ? 'bg-white text-vault-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-vault-300 dark:ring-slate-700'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  aria-pressed={timeZone === zone.id}
                >
                  <span className="block text-xs font-bold">{zone.flag} {zone.country}</span>
                  <span className="text-[10px] opacity-70">Hora de {zone.city}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <label className="form-field">
            <span>Título</span>
            <input className="input-field" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={60} placeholder="Ej. Reunión con Madrid" />
          </label>
          <label className="form-field">
            <span>Mensaje <small>(opcional)</small></span>
            <input className="input-field" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={160} placeholder="Detalle de la alerta" />
          </label>
          <label className="form-field">
            <span>Fecha y hora en {timeZone === 'America/Lima' ? 'Perú' : 'España'}</span>
            <input type="datetime-local" className="input-field" value={scheduledAt} min={timestampToZonedInput(Date.now(), timeZone)} onChange={(event) => setScheduledAt(event.target.value)} />
          </label>
          {Number.isFinite(selectedTimestamp) && (
            <div className="flex items-start gap-2 rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2.5 text-[11px] leading-relaxed text-cyan-900 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-200">
              <Globe2 className="mt-0.5 h-3.5 w-3.5 flex-none" />
              <span>
                Se ejecutará el {formatReminderTime(selectedTimestamp, timeZone)} en {timeZone === 'America/Lima' ? 'Lima' : 'Madrid'}.
                En {alternateCity} serán las {new Intl.DateTimeFormat('es-PE', { timeZone: alternateZone, hour: '2-digit', minute: '2-digit' }).format(selectedTimestamp)}.
              </span>
            </div>
          )}
          <button className="btn-primary flex items-center justify-center gap-2" disabled={busy === 'new'}>
            {busy === 'new' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Programar alerta
          </button>
        </form>

        <section>
          <div className="mb-2 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Mis recordatorios</h2>
              <p className="text-[11px] text-slate-500">{upcoming} próximo{upcoming === 1 ? '' : 's'}</p>
            </div>
          </div>
          {loading ? (
            <div className="py-8 text-center"><LoaderCircle className="mx-auto h-5 w-5 animate-spin text-vault-500" /></div>
          ) : reminders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 py-7 text-center dark:border-slate-700">
              <Bell className="mx-auto h-5 w-5 text-slate-400" />
              <p className="mt-2 text-xs text-slate-500">Todavía no hay alertas programadas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reminders.map((reminder) => {
                const expired = reminder.scheduledAt <= Date.now()
                const reminderZone = reminder.timeZone || 'America/Lima'
                const zone = zones.find((item) => item.id === reminderZone) || zones[0]
                return (
                  <article key={reminder.id} className={`card flex items-center gap-3 p-3 ${!reminder.enabled ? 'opacity-60' : ''}`}>
                    <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl ${reminder.enabled && !expired ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-700'}`}>
                      {reminder.enabled && !expired ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-sm text-slate-900 dark:text-white">{reminder.title}</strong>
                      <span className="block text-[11px] text-slate-500">{zone.flag} {formatReminderTime(reminder.scheduledAt, reminderZone)} · {zone.city}{expired ? ' · finalizado' : ''}</span>
                    </div>
                    <button onClick={() => void toggle(reminder)} disabled={busy === reminder.id || expired} className="rounded-lg px-2 py-1 text-[10px] font-bold text-vault-600 hover:bg-vault-50 disabled:opacity-40 dark:text-vault-300 dark:hover:bg-vault-950" aria-label={reminder.enabled ? 'Desactivar' : 'Activar'}>
                      {reminder.enabled ? 'ON' : 'OFF'}
                    </button>
                    <IconButton label="Eliminar" onClick={() => void deleteReminder(reminder)} disabled={busy === reminder.id}><Trash2 className="h-4 w-4 text-red-500" /></IconButton>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

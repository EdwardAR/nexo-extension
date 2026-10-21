import { FormEvent, useEffect, useMemo, useState } from 'react'
import { AlarmClock, ArrowLeft, Bell, BellOff, Check, Clock, Globe2, LoaderCircle, MonitorUp, Plus, Settings2, Trash2, Volume2 } from 'lucide-react'
import {
  timestampToZonedInput,
  zonedInputToTimestamp,
  type ReminderTimeZone,
  type ScheduledReminder,
} from '../../shared/reminder'
import {
  getTimeZoneConfig,
  TIME_ZONE_CONFIGS,
  type TimeZoneConfig,
} from '../../shared/timezones'
import {
  DEFAULT_FLOATING_CLOCK_SETTINGS,
  loadFloatingClockSettings,
  saveFloatingClockSettings,
  isFloatingClockEnabled,
  setFloatingClockEnabled as persistFloatingClockEnabled,
  type FloatingClockSettings,
} from '../../shared/floating-clock'
import { useReminders } from '../hooks/useReminders'
import { IconButton } from './IconButton'

interface TimePanelProps {
  onClose: () => void
  onToast: (message: string, type: 'success' | 'error' | 'info') => void
}

interface ZoneClockProps {
  zone: TimeZoneConfig
  now: Date
}

function defaultTimestamp() {
  const date = new Date(Date.now() + 60 * 60 * 1000)
  date.setMinutes(Math.ceil(date.getMinutes() / 5) * 5, 0, 0)
  return date.getTime()
}

function formatReminderTime(timestamp: number, timeZone: ReminderTimeZone) {
  const zone = getTimeZoneConfig(timeZone) || TIME_ZONE_CONFIGS[0]
  return new Intl.DateTimeFormat(zone.locale, {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(timestamp)
}

function ZoneClock({ zone, now }: ZoneClockProps) {
  const time = useMemo(() => new Intl.DateTimeFormat(zone.locale, {
    timeZone: zone.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now), [now, zone])
  const date = useMemo(() => new Intl.DateTimeFormat(zone.locale, {
    timeZone: zone.timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(now), [now, zone])
  const zoneName = useMemo(() => new Intl.DateTimeFormat(zone.locale, {
    timeZone: zone.timeZone,
    timeZoneName: 'short',
  }).formatToParts(now).find((part) => part.type === 'timeZoneName')?.value, [now, zone])

  return (
    <article className="zone-clock relative overflow-hidden border border-white/10 bg-white/10 text-white backdrop-blur">
      <span className={`absolute -right-4 -top-5 h-14 w-14 rounded-full ${zone.accent} opacity-40 blur-xl`} />
      <strong className="type-clock block">{time}</strong>
      <strong className="type-city block">{zone.city}</strong>
      <div className="zone-clock-meta type-secondary text-white/70">
        <span className="inline-flex min-w-0 items-center gap-1.5"><Globe2 className="icon-status" /> <span className="truncate">{zone.country}</span></span>
        <span>{zoneName}</span>
      </div>
      <span className="zone-clock-date type-secondary capitalize">{date}</span>
    </article>
  )
}

export function TimePanel({ onClose, onToast }: TimePanelProps) {
  const { reminders, loading, save, remove, testNotification } = useReminders()
  const [now, setNow] = useState(() => new Date())
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [timeZone, setTimeZone] = useState<ReminderTimeZone>('America/Lima')
  const [scheduledAt, setScheduledAt] = useState(() => timestampToZonedInput(defaultTimestamp(), 'America/Lima'))
  const [busy, setBusy] = useState('')
  const [floatingClockEnabled, setFloatingClockEnabled] = useState(false)
  const [floatingClockSettings, setFloatingClockSettings] = useState<FloatingClockSettings>(DEFAULT_FLOATING_CLOCK_SETTINGS)
  const [showFloatingClockSettings, setShowFloatingClockSettings] = useState(false)
  const selectedZone = getTimeZoneConfig(timeZone) || TIME_ZONE_CONFIGS[0]
  const alternateZones = TIME_ZONE_CONFIGS.filter((zone) => zone.id !== timeZone)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    void isFloatingClockEnabled().then(setFloatingClockEnabled)
    void loadFloatingClockSettings().then(setFloatingClockSettings)
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
        scheduledLocalTime: scheduledAt,
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

  const testAlert = async () => {
    try {
      setBusy('test')
      await testNotification()
      onToast('Prueba enviada: revisa la notificación y el sonido', 'success')
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'No se pudo probar el aviso', 'error')
    } finally {
      setBusy('')
    }
  }

  const toggleFloatingClock = async () => {
    const enabled = !floatingClockEnabled
    try {
      setBusy('floating-clock')
      await persistFloatingClockEnabled(enabled)
      setFloatingClockEnabled(enabled)
      onToast(enabled ? 'Reloj flotante activado' : 'Reloj flotante desactivado', 'success')
    } catch {
      onToast('No se pudo cambiar el reloj flotante', 'error')
    } finally {
      setBusy('')
    }
  }

  const toggleFloatingClockCity = async (city: ReminderTimeZone) => {
    const visible = floatingClockSettings.cities.includes(city)
    if (visible && floatingClockSettings.cities.length === 1) {
      onToast('Mantén al menos una ciudad visible', 'error')
      return
    }
    const cities = visible
      ? floatingClockSettings.cities.filter((item) => item !== city)
      : [...floatingClockSettings.cities, city]
    try {
      setBusy('floating-clock-settings')
      const nextSettings = await saveFloatingClockSettings({
        cities,
        primary: cities.includes(floatingClockSettings.primary) ? floatingClockSettings.primary : cities[0],
      })
      setFloatingClockSettings(nextSettings)
    } catch {
      onToast('No se pudo actualizar las ciudades visibles', 'error')
    } finally {
      setBusy('')
    }
  }

  const changeFloatingClockPrimary = async (city: ReminderTimeZone) => {
    try {
      setBusy('floating-clock-settings')
      const nextSettings = await saveFloatingClockSettings({ ...floatingClockSettings, primary: city })
      setFloatingClockSettings(nextSettings)
    } catch {
      onToast('No se pudo cambiar la ciudad principal', 'error')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-vault-900 to-cyan-900 px-3 pb-2 pt-2">
        <div className="mb-2 flex items-center gap-2 text-white">
          <IconButton className="h-8 w-8" label="Volver" onClick={onClose} tone="inverse"><ArrowLeft className="h-4 w-4" /></IconButton>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15"><Clock className="icon-panel-header" /></span>
          <div>
            <h1 className="type-panel-title">Horarios y alertas</h1>
            <p className="type-panel-subtitle text-cyan-100/80">Lima, Madrid y Casablanca en tiempo real</p>
          </div>
        </div>
        <div className="zone-clocks">
          {TIME_ZONE_CONFIGS.map((zone) => <ZoneClock key={zone.id} zone={zone} now={now} />)}
        </div>
        <div className="mt-2 rounded-xl border border-white/10 bg-white/10 px-2.5 py-2 text-white backdrop-blur">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-cyan-300/15 text-cyan-200"><MonitorUp className="h-4 w-4" /></span>
            <button type="button" onClick={() => void toggleFloatingClock()} disabled={busy === 'floating-clock'} className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left disabled:opacity-60">
              <span className="min-w-0">
                <strong className="type-floating-title block">Reloj flotante</strong>
                <small className="type-floating-secondary block truncate text-cyan-100/65">{floatingClockSettings.cities.length} {floatingClockSettings.cities.length === 1 ? 'ciudad visible' : 'ciudades visibles'}</small>
              </span>
              <span className={`relative h-5 w-9 flex-none rounded-full transition ${floatingClockEnabled ? 'bg-cyan-400' : 'bg-white/20'}`} aria-hidden="true">
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${floatingClockEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
              </span>
            </button>
            <button type="button" onClick={() => setShowFloatingClockSettings((value) => !value)} className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-cyan-100 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200" aria-label="Configurar ciudades del reloj flotante" aria-expanded={showFloatingClockSettings}>
              <Settings2 className="h-4 w-4" />
            </button>
          </div>
          {showFloatingClockSettings && (
            <div className="mt-2 border-t border-white/10 pt-2">
              <span className="type-secondary block font-semibold text-cyan-50">Ciudades visibles</span>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {TIME_ZONE_CONFIGS.map((zone) => {
                  const selected = floatingClockSettings.cities.includes(zone.id)
                  return (
                    <button key={zone.id} type="button" onClick={() => void toggleFloatingClockCity(zone.id)} disabled={busy === 'floating-clock-settings'} className={`type-secondary flex min-w-0 items-center justify-center gap-1 rounded-lg px-1.5 py-2 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 ${selected ? 'bg-white/15 text-white' : 'text-cyan-100/55 hover:bg-white/10 hover:text-cyan-50'} disabled:opacity-60`} aria-pressed={selected}>
                      {selected && <Check className="h-3.5 w-3.5 flex-none" />}
                      <span className="truncate">{zone.city}</span>
                    </button>
                  )
                })}
              </div>
              <label className="mt-3 block">
                <span className="type-secondary block text-cyan-100/70">Ciudad principal</span>
                <select value={floatingClockSettings.primary} onChange={(event) => void changeFloatingClockPrimary(event.target.value as ReminderTimeZone)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/40 px-2.5 py-2 text-xs font-medium text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200/40" disabled={busy === 'floating-clock-settings'}>
                  {TIME_ZONE_CONFIGS.filter((zone) => floatingClockSettings.cities.includes(zone.id)).map((zone) => <option key={zone.id} value={zone.id}>{zone.city}</option>)}
                </select>
              </label>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 space-y-3 overflow-y-auto px-4 pb-4 pt-3">
        <form onSubmit={submit} className="card space-y-2 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-vault-50 text-vault-600 dark:bg-vault-950 dark:text-vault-300"><AlarmClock className="h-4 w-4" /></span>
              <div>
                <h2 className="type-panel-section text-slate-900 dark:text-white">Nuevo recordatorio</h2>
                <p className="type-panel-subtitle text-slate-500">Elige en qué país defines la hora</p>
              </div>
            </div>
            <button type="button" onClick={() => void testAlert()} disabled={busy === 'test'} className="type-floating-secondary flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1.5 font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
              {busy === 'test' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Volume2 className="h-3.5 w-3.5" />}
              Probar aviso
            </button>
          </div>
          <fieldset>
            <legend className="type-secondary mb-1.5 font-semibold text-slate-600 dark:text-slate-300">Horario de referencia</legend>
            <div className="reference-zone-grid grid gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-950/60">
              {TIME_ZONE_CONFIGS.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => changeTimeZone(zone.id)}
                  className={`reference-zone-option rounded-lg px-2 py-1.5 text-left transition ${timeZone === zone.id
                    ? 'bg-white text-vault-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-vault-300 dark:ring-slate-700'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  aria-pressed={timeZone === zone.id}
                >
                  <span className="reference-zone-country type-secondary flex items-center gap-1.5 font-semibold"><Globe2 className="reference-zone-icon" /> {zone.country}</span>
                  <span className="reference-zone-city type-secondary opacity-70">Hora de {zone.city}</span>
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
            <span>Fecha y hora en {selectedZone.country}</span>
            <input type="datetime-local" className="input-field" value={scheduledAt} min={timestampToZonedInput(Date.now(), timeZone)} onChange={(event) => setScheduledAt(event.target.value)} />
          </label>
          {Number.isFinite(selectedTimestamp) && (
          <div className="type-secondary flex items-start gap-2 rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2.5 text-cyan-900 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-200">
              <Globe2 className="mt-0.5 h-3.5 w-3.5 flex-none" />
              <span>
                <strong className="block">Hora de {selectedZone.city}: {formatReminderTime(selectedTimestamp, timeZone)}</strong>
                {alternateZones.map((zone) => (
                  <span key={zone.id} className="mt-0.5 block">Equivale en {zone.city}: {formatReminderTime(selectedTimestamp, zone.id)}.</span>
                ))}
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
              <h2 className="type-section text-slate-900 dark:text-white">Mis recordatorios</h2>
              <p className="type-secondary text-slate-500">{upcoming} próximo{upcoming === 1 ? '' : 's'}</p>
            </div>
          </div>
          {loading ? (
            <div className="py-8 text-center"><LoaderCircle className="mx-auto h-5 w-5 animate-spin text-vault-500" /></div>
          ) : reminders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 py-7 text-center dark:border-slate-700">
              <Bell className="icon-action mx-auto text-slate-400" />
              <p className="type-secondary mt-2 text-slate-500">Todavía no hay alertas programadas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reminders.map((reminder) => {
                const expired = reminder.scheduledAt <= Date.now()
                const ringing = reminder.deliveryStatus === 'ringing'
                const reminderZone = reminder.timeZone || 'America/Lima'
                const zone = getTimeZoneConfig(reminderZone) || TIME_ZONE_CONFIGS[0]
                return (
                  <article key={reminder.id} className={`card flex items-center gap-3 p-3 ${!reminder.enabled && !ringing ? 'opacity-60' : ''}`}>
                    <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl ${reminder.enabled && !expired || ringing ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-700'}`}>
                      {reminder.enabled && !expired || ringing ? <Bell className={`h-4 w-4 ${ringing ? 'animate-pulse' : ''}`} /> : <BellOff className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="type-section block truncate text-slate-900 dark:text-white">{reminder.title}</strong>
                      <span className="type-secondary block text-slate-500"><Globe2 className="mr-1 inline-block align-[-2px]" size={14} />{formatReminderTime(reminder.scheduledAt, reminderZone)} · {zone.city}{ringing ? ' · sonando' : expired ? ' · finalizado' : ''}</span>
                      {reminder.deliveryError && (
                        <span className={`type-secondary mt-0.5 block font-semibold ${reminder.deliveryStatus === 'delivered' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{reminder.deliveryError}</span>
                      )}
                    </div>
                    <button onClick={() => void toggle(reminder)} disabled={busy === reminder.id || expired} className="type-secondary rounded-lg px-2 py-1 font-semibold text-vault-600 hover:bg-vault-50 disabled:opacity-40 dark:text-vault-300 dark:hover:bg-vault-950" aria-label={reminder.enabled ? 'Desactivar' : 'Activar'}>
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

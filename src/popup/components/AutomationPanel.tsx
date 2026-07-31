import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  CalendarClock,
  CircleDot,
  Clock3,
  MousePointerClick,
  Play,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import type { ClickAutomation } from '../../shared/automation'
import { useAutomations } from '../hooks/useAutomations'
import { IconButton } from './IconButton'

interface AutomationPanelProps {
  onClose: () => void
  onToast: (message: string, type: 'success' | 'error' | 'info') => void
}

function toInputDate(timestamp?: number) {
  if (!timestamp) return ''
  const date = new Date(timestamp - new Date(timestamp).getTimezoneOffset() * 60_000)
  return date.toISOString().slice(0, 16)
}

export function AutomationPanel({ onClose, onToast }: AutomationPanelProps) {
  const { automations, loading, save, remove, record, run } = useAutomations()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [scheduling, setScheduling] = useState<ClickAutomation | null>(null)
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [busy, setBusy] = useState('')
  const stats = useMemo(() => ({
    clicks: automations.reduce((total, automation) => total + automation.steps.length, 0),
    scheduled: automations.filter((automation) => automation.schedule?.enabled).length,
  }), [automations])

  useEffect(() => {
    void chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.url?.startsWith('http')) setUrl(tab.url)
    })
  }, [])

  const startNewRecording = async () => {
    try {
      const parsedUrl = new URL(url)
      if (!['http:', 'https:'].includes(parsedUrl.protocol) || !name.trim()) {
        onToast('Indica un nombre y una URL HTTP o HTTPS', 'error')
        return
      }
      const now = Date.now()
      const automation: ClickAutomation = {
        id: crypto.randomUUID(),
        name: name.trim(),
        url: parsedUrl.href,
        steps: [],
        createdAt: now,
        updatedAt: now,
        lastStatus: 'idle',
      }
      setBusy('new')
      await save(automation)
      await record(automation.id)
      window.close()
    } catch (error) {
      onToast(
        error instanceof Error ? error.message : 'No se pudo iniciar la grabación',
        'error'
      )
      setBusy('')
    }
  }

  const openSchedule = (automation: ClickAutomation) => {
    setScheduling(automation)
    setStartAt(toInputDate(automation.schedule?.startAt))
    setEndAt(toInputDate(automation.schedule?.endAt))
  }

  const saveSchedule = async () => {
    if (!scheduling || !startAt) {
      onToast('Selecciona cuándo debe comenzar', 'error')
      return
    }
    const start = new Date(startAt).getTime()
    const end = endAt ? new Date(endAt).getTime() : undefined
    if (!Number.isFinite(start) || (end && end <= start)) {
      onToast('La franja horaria no es válida', 'error')
      return
    }
    try {
      setBusy('schedule')
      await save({
        ...scheduling,
        schedule: { enabled: true, startAt: start, endAt: end },
        updatedAt: Date.now(),
      })
      onToast('Secuencia programada', 'success')
      setScheduling(null)
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'No se pudo programar', 'error')
    } finally {
      setBusy('')
    }
  }

  const runNow = async (automation: ClickAutomation) => {
    try {
      setBusy(automation.id)
      await run(automation.id)
      onToast('Secuencia iniciada', 'info')
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'No se pudo ejecutar', 'error')
    } finally {
      setBusy('')
    }
  }

  const recordAgain = async (automation: ClickAutomation) => {
    if (
      automation.steps.length &&
      !confirm(`Se reemplazarán los ${automation.steps.length} clics de “${automation.name}”. ¿Continuar?`)
    ) return
    try {
      setBusy(automation.id)
      await record(automation.id)
      window.close()
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'No se pudo grabar', 'error')
      setBusy('')
    }
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <header className="bg-gradient-to-br from-vault-600 to-vault-900 px-4 py-4 text-white">
        <div className="flex items-center gap-3">
          <IconButton label="Volver a contraseñas" onClick={onClose} tone="inverse">
            <ArrowLeft className="h-4 w-4" />
          </IconButton>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <MousePointerClick className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-base font-bold">Secuencias de clics</h1>
            <p className="text-xs text-vault-100">Módulo de automatizaciones</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-800">
            <strong className="block text-lg text-slate-900 dark:text-white">{automations.length}</strong>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Secuencias</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-800">
            <strong className="block text-lg text-vault-600 dark:text-vault-300">{stats.clicks}</strong>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Clics</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-800">
            <strong className="block text-lg text-amber-600 dark:text-amber-300">{stats.scheduled}</strong>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Programadas</span>
          </div>
        </div>

        <section className="relative mb-5 overflow-hidden rounded-2xl border border-vault-100 bg-white p-4 shadow-sm dark:border-vault-900 dark:bg-slate-800">
          <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-vault-100/70 blur-2xl dark:bg-vault-900/30" />
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40">
              <CircleDot className="h-4 w-4 text-red-500" />
            </span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Grabar nueva secuencia</h2>
          </div>
          <p className="mb-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Abre la página, registra cada clic y guarda la secuencia al pulsar <strong>Terminar y guardar</strong>.
          </p>
          <div className="space-y-2">
            <input
              className="input-field"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre, por ejemplo: Descargar reporte"
            />
            <input
              className="input-field"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://ejemplo.com/pagina"
            />
            <button
              className="btn-primary flex items-center justify-center gap-2"
              onClick={startNewRecording}
              disabled={busy === 'new'}
            >
              <CircleDot className="h-4 w-4" />
              Empezar a grabar clics
            </button>
            <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[9px] font-bold uppercase tracking-wide text-slate-400">
              <span>1 · Graba</span>
              <span>2 · Guarda</span>
              <span>3 · Programa</span>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Secuencias guardadas · {automations.length}
            </h2>
          </div>
          {loading ? (
            <p className="py-4 text-center text-xs text-slate-500">Cargando…</p>
          ) : automations.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs leading-5 text-slate-500 dark:border-slate-700">
              Todavía no hay secuencias. Inicia una grabación y pulsa “Terminar y guardar” en la página.
            </p>
          ) : (
            <div className="space-y-2">
              {automations.map((automation) => (
                <article key={automation.id} className="rounded-xl border border-slate-200 border-l-4 border-l-vault-400 bg-white p-3 shadow-sm transition hover:border-vault-300 hover:shadow-md dark:border-slate-700 dark:border-l-vault-600 dark:bg-slate-800">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{automation.name}</h3>
                      <p className="truncate text-[11px] text-slate-500">{automation.url}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      automation.lastStatus === 'recording'
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                        : automation.steps.length
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}>
                      {automation.lastStatus === 'recording'
                        ? 'Grabando'
                        : `${automation.steps.length} clic${automation.steps.length === 1 ? '' : 's'}`}
                    </span>
                  </div>

                  {automation.schedule?.enabled && (
                    <p className="mt-2 flex items-center gap-1 text-[11px] text-vault-600 dark:text-vault-300">
                      <CalendarClock className="h-3 w-3" />
                      Programada: {new Date(automation.schedule.startAt).toLocaleString('es-PE')}
                      {automation.schedule.endAt && ` – ${new Date(automation.schedule.endAt).toLocaleString('es-PE')}`}
                    </p>
                  )}
                  {automation.lastError && (
                    <p className="mt-2 text-[11px] text-red-600 dark:text-red-400">{automation.lastError}</p>
                  )}

                  <div className="mt-3 grid grid-cols-3 gap-1">
                    <button
                      className="btn-ghost flex items-center justify-center gap-1 px-1 text-xs"
                      onClick={() => runNow(automation)}
                      disabled={!automation.steps.length || automation.lastStatus === 'recording' || Boolean(busy)}
                    >
                      <Play className="h-3.5 w-3.5" /> Ejecutar
                    </button>
                    <button
                      className="btn-ghost flex items-center justify-center gap-1 px-1 text-xs"
                      onClick={() => openSchedule(automation)}
                      disabled={!automation.steps.length || automation.lastStatus === 'recording' || Boolean(busy)}
                    >
                      <Clock3 className="h-3.5 w-3.5" /> Programar
                    </button>
                    <button
                      className="btn-ghost flex items-center justify-center gap-1 px-1 text-xs"
                      onClick={() => recordAgain(automation)}
                      disabled={Boolean(busy)}
                    >
                      <CircleDot className="h-3.5 w-3.5 text-red-500" /> Regrabar
                    </button>
                  </div>
                  <button
                    className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    onClick={async () => {
                      if (!confirm(`¿Eliminar la secuencia “${automation.name}”?`)) return
                      await remove(automation.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" /> Eliminar secuencia
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {scheduling && (
        <div className="modal-overlay" onClick={() => setScheduling(null)} role="presentation">
          <div className="modal-content" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="schedule-title">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 id="schedule-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">Programar secuencia</h2>
                <p className="text-xs text-slate-500">{scheduling.name}</p>
              </div>
              <IconButton label="Cerrar" onClick={() => setScheduling(null)}>
                <X className="h-4 w-4" />
              </IconButton>
            </div>
            <div className="space-y-3">
              <label className="form-field">
                <span>Fecha y hora de ejecución</span>
                <input className="input-field" type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} />
              </label>
              <label className="form-field">
                <span>Fin de la franja <small>(opcional)</small></span>
                <input className="input-field" type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} />
              </label>
              <p className="text-[11px] leading-4 text-slate-500">
                Chrome ejecutará la secuencia al inicio. Si no puede hacerlo antes del final, la marcará como omitida.
              </p>
              <button className="btn-primary flex items-center justify-center gap-2" onClick={saveSchedule} disabled={busy === 'schedule'}>
                <Save className="h-4 w-4" /> Guardar programación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

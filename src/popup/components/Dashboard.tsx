import { useMemo } from 'react'
import { BellRing, ChevronRight, Clock3, DatabaseBackup, KeyRound, LockKeyhole, Orbit, ShieldCheck, Sparkles } from 'lucide-react'
import type { PasswordEntry } from '../types'
import { getRenewalInfo } from '../../shared/renewal'
import { IconButton } from './IconButton'
import { ThemeToggle } from './ThemeToggle'

interface DashboardProps {
  entries: PasswordEntry[]
  onLock: () => void
  onOpenData: () => void
  onOpenRenewals: () => void
  onOpenTime: () => void
  onOpenPasswords: () => void
  dark: boolean
  onToggleTheme: () => void
}

export function Dashboard({
  entries,
  onLock,
  onOpenData,
  onOpenRenewals,
  onOpenTime,
  onOpenPasswords,
  dark,
  onToggleTheme,
}: DashboardProps) {
  const renewalCount = useMemo(
    () => entries.filter((entry) => getRenewalInfo(entry).status !== 'current').length,
    [entries]
  )

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-vault-900 to-cyan-900 px-5 pb-7 pt-4">
        <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-36 w-36 rounded-full bg-vault-400/20 blur-3xl" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/15 shadow-inner backdrop-blur">
              <Orbit className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">Nexo</h1>
              <p className="text-xs text-cyan-100/70">Tu centro digital</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle dark={dark} onToggle={onToggleTheme} inverse />
            <IconButton label="Importar o exportar datos" onClick={onOpenData} tone="inverse"><DatabaseBackup className="h-4 w-4" /></IconButton>
            <IconButton label="Bloquear bóveda" onClick={onLock} tone="inverse"><LockKeyhole className="h-4 w-4" /></IconButton>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/70">Bóveda protegida</p>
            <p className="mt-1 text-lg font-semibold text-white">{entries.length} {entries.length === 1 ? 'acceso seguro' : 'accesos seguros'}</p>
          </div>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200">● Activa</span>
        </div>
      </header>

      <nav className="relative -mt-4 grid grid-cols-2 gap-2.5 px-4" aria-label="Módulos de Nexo">
        <button onClick={onOpenPasswords} className="group relative col-span-2 flex items-center gap-3 overflow-hidden rounded-2xl border border-vault-200 bg-gradient-to-r from-white via-white to-vault-50 p-3.5 text-left shadow-lg shadow-vault-950/10 transition hover:-translate-y-0.5 hover:border-vault-300 dark:border-vault-800 dark:from-slate-800 dark:via-slate-800 dark:to-vault-950/70 dark:hover:border-vault-700">
          <span className="pointer-events-none absolute -right-5 -top-8 h-20 w-20 rounded-full bg-vault-300/20 blur-xl" />
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-vault-500 to-vault-700 text-white shadow-md shadow-vault-500/25 transition group-hover:scale-105"><KeyRound className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1">
            <strong className="block text-sm font-bold text-slate-900 dark:text-white">Contraseñas</strong>
            <small className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">Consulta y administra {entries.length === 1 ? 'tu acceso' : 'tus accesos'}</small>
          </span>
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-vault-500 shadow-sm ring-1 ring-vault-100 transition group-hover:translate-x-0.5 dark:bg-slate-700 dark:ring-slate-600"><ChevronRight className="h-4 w-4" /></span>
        </button>
        <button onClick={onOpenTime} className="group rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-cyan-700">
          <div className="mb-3 flex items-start justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 transition group-hover:bg-cyan-100 dark:bg-cyan-950/60 dark:text-cyan-300"><Clock3 className="h-4 w-4" /></span>
            <ChevronRight className="mt-1 h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-500" />
          </div>
          <strong className="block text-xs text-slate-900 dark:text-white">Horarios</strong>
          <small className="mt-0.5 block text-[10px] text-slate-400">Relojes y alertas</small>
        </button>
        <button onClick={onOpenRenewals} className="group relative rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-amber-700">
          <div className="mb-3 flex items-start justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300"><BellRing className="h-4 w-4" /></span>
            <ChevronRight className="mt-1 h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-amber-500" />
          </div>
          <strong className="block text-xs text-slate-900 dark:text-white">Renovar</strong>
          <small className="mt-0.5 block text-[10px] text-slate-400">{renewalCount ? `${renewalCount} pendiente${renewalCount === 1 ? '' : 's'}` : 'Todo al día'}</small>
          {renewalCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-800" />}
        </button>
      </nav>

      <main className="flex-1 px-4 pb-4 pt-5">
        <div className="mb-2.5 flex items-center gap-2 px-1">
          <Sparkles className="h-3.5 w-3.5 text-vault-500" />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Estado de Nexo</h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-800/70">
          <div className="flex items-center gap-3 p-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300"><ShieldCheck className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1">
              <strong className="block text-xs text-slate-800 dark:text-slate-100">Protección activa</strong>
              <small className="mt-0.5 block text-[10px] text-slate-400">Tu bóveda permanece cifrada</small>
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">Seguro</span>
          </div>
          <div className="grid grid-cols-2 border-t border-slate-100 dark:border-slate-700/70">
            <div className="border-r border-slate-100 px-4 py-3 dark:border-slate-700/70">
              <span className="block text-lg font-bold leading-none text-slate-900 dark:text-white">{entries.length}</span>
              <small className="mt-1 block text-[10px] text-slate-400">Accesos guardados</small>
            </div>
            <div className="px-4 py-3">
              <span className={`block text-lg font-bold leading-none ${renewalCount ? 'text-amber-500' : 'text-emerald-500'}`}>{renewalCount}</span>
              <small className="mt-1 block text-[10px] text-slate-400">Por revisar</small>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

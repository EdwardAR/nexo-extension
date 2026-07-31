import { useState } from 'react'
import {
  ShieldCheck, KeyRound, Zap, ChevronRight, ArrowRight,
  LockKeyhole, AlertTriangle, MousePointerClick, Orbit, Clock3,
} from 'lucide-react'

interface OnboardingSlidesProps {
  onFinish: () => void
}

interface Slide {
  icon: typeof ShieldCheck
  iconBg: string
  iconColor: string
  badge?: { icon: typeof AlertTriangle; color: string; bg: string }
  title: string
  description: string
  tip: string
  tipIcon: typeof AlertTriangle
  tipColor: string
  tipBg: string
  tipBorder: string
}

const slides: Slide[] = [
  {
    icon: KeyRound,
    iconBg: 'bg-vault-50 dark:bg-vault-950/60',
    iconColor: 'text-vault-600 dark:text-vault-300',
    badge: {
      icon: LockKeyhole,
      color: 'text-white',
      bg: 'bg-vault-600',
    },
    title: 'Tu contraseña maestra',
    description:
      'Es la única clave que protege todas tus contraseñas. Elige algo largo y memorable, como una frase que solo tú conozcas.',
    tip: 'Nexo nunca la almacena ni la transmite — solo tú la sabes. Si la olvidas no hay forma de recuperar tus datos.',
    tipIcon: AlertTriangle,
    tipColor: 'text-amber-700 dark:text-amber-300',
    tipBg: 'bg-amber-50 dark:bg-amber-950/30',
    tipBorder: 'border-amber-200 dark:border-amber-900',
  },
  {
    icon: ShieldCheck,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-600 dark:text-emerald-300',
    badge: undefined,
    title: 'Todo cifrado localmente',
    description:
      'Tus contraseñas se cifran con AES-256 directamente en tu navegador antes de guardarse. Ningún servidor externo recibe tus datos.',
    tip: 'El cifrado ocurre en tu dispositivo. Nexo funciona completamente sin conexión a internet.',
    tipIcon: ShieldCheck,
    tipColor: 'text-emerald-700 dark:text-emerald-300',
    tipBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    tipBorder: 'border-emerald-200 dark:border-emerald-900',
  },
  {
    icon: Zap,
    iconBg: 'bg-sky-50 dark:bg-sky-950/40',
    iconColor: 'text-sky-600 dark:text-sky-300',
    badge: undefined,
    title: 'Autorrelleno en un click',
    description:
      'Cuando visites un sitio guardado, aparecerá un botón morado en el campo de contraseña. Haz click para rellenar usuario y contraseña al instante.',
    tip: 'Busca el ícono de escudo en los campos de contraseña. Si el vault está bloqueado, te pedirá que lo abras primero.',
    tipIcon: MousePointerClick,
    tipColor: 'text-sky-700 dark:text-sky-300',
    tipBg: 'bg-sky-50 dark:bg-sky-950/30',
    tipBorder: 'border-sky-200 dark:border-sky-900',
  },
  {
    icon: Orbit,
    iconBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    iconColor: 'text-cyan-700 dark:text-cyan-300',
    badge: undefined,
    title: 'Todo conectado en Nexo',
    description:
      'Consulta horarios de Perú y España, programa recordatorios, controla renovaciones y crea automatizaciones desde un mismo centro.',
    tip: 'Elige el país al programar una alerta: Nexo convierte la hora y respeta automáticamente el horario de verano.',
    tipIcon: Clock3,
    tipColor: 'text-cyan-800 dark:text-cyan-200',
    tipBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    tipBorder: 'border-cyan-200 dark:border-cyan-900',
  },
]

export function OnboardingSlides({ onFinish }: OnboardingSlidesProps) {
  const [current, setCurrent] = useState(0)
  const [exiting, setExiting] = useState(false)

  const slide = slides[current]
  const isLast = current === slides.length - 1

  const goTo = (index: number) => {
    if (index === current) return
    setExiting(true)
    setTimeout(() => {
      setCurrent(index)
      setExiting(false)
    }, 180)
  }

  const next = () => {
    if (isLast) {
      onFinish()
    } else {
      goTo(current + 1)
    }
  }

  const SlideIcon = slide.icon
  const TipIcon = slide.tipIcon

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-slate-50 px-6 py-8 dark:bg-slate-950">
      {/* Blob decorativo */}
      <div className="pointer-events-none absolute left-1/2 top-[-80px] h-64 w-64 -translate-x-1/2 rounded-full bg-vault-200/50 blur-3xl dark:bg-vault-900/30" />

      {/* Header con dots y skip */}
      <div className="relative flex w-full items-center justify-between">
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-5 h-2 bg-vault-600 dark:bg-vault-400'
                  : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
        {!isLast && (
          <button
            onClick={onFinish}
            className="text-xs font-medium text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            Omitir
          </button>
        )}
      </div>

      {/* Slide content */}
      <div
        className={`relative flex flex-1 flex-col items-center justify-center transition-all duration-200 ${
          exiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Icono principal */}
        <div className={`relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl ${slide.iconBg} border border-white/60 dark:border-white/5 shadow-lg`}>
          <SlideIcon className={`h-11 w-11 ${slide.iconColor}`} />
          {slide.badge && (
            <span className={`absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-50 dark:border-slate-950 ${slide.badge.bg}`}>
              <slide.badge.icon className={`h-4 w-4 ${slide.badge.color}`} />
            </span>
          )}
        </div>

        {/* Número de slide */}
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-vault-500 dark:text-vault-400">
          {current + 1} / {slides.length}
        </p>

        {/* Título */}
        <h2 className="mb-3 text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {slide.title}
        </h2>

        {/* Descripción */}
        <p className="mb-6 max-w-[280px] text-center text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {slide.description}
        </p>

        {/* Tip */}
        <div className={`flex w-full max-w-[300px] items-start gap-2.5 rounded-xl border ${slide.tipBorder} ${slide.tipBg} p-3`}>
          <TipIcon className={`mt-0.5 h-4 w-4 flex-none ${slide.tipColor}`} />
          <p className={`text-xs leading-relaxed ${slide.tipColor}`}>
            {slide.tip}
          </p>
        </div>
      </div>

      {/* Botón de acción */}
      <div className="relative w-full space-y-3">
        <button
          onClick={next}
          className="btn-primary flex items-center justify-center gap-2 py-3 shadow-lg shadow-vault-600/20"
        >
          {isLast ? (
            <>
              Comenzar <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              Siguiente <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

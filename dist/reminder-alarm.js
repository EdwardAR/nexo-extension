const params = new URLSearchParams(location.search)
const reminderId = params.get('id') || ''
const title = params.get('title') || 'Recordatorio de Nexo'
const message = params.get('message') || 'Tienes un recordatorio pendiente.'
const titleElement = document.getElementById('title')
const messageElement = document.getElementById('message')
const acknowledgeButton = document.getElementById('acknowledge')
const statusElement = document.getElementById('status')

titleElement.textContent = title
messageElement.textContent = message

let audioContext
let ringTimer
let stopped = false

async function ensureAudio() {
  if (!audioContext) audioContext = new AudioContext()
  if (audioContext.state !== 'running') await audioContext.resume()
  return audioContext
}

async function ring() {
  if (stopped) return
  try {
    const context = await ensureAudio()
    const start = context.currentTime + 0.03
    const gain = context.createGain()
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.55, start + 0.04)
    gain.gain.setValueAtTime(0.55, start + 0.9)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.25)
    gain.connect(context.destination)

    ;[880, 660, 880, 660].forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      oscillator.type = index % 2 ? 'square' : 'sine'
      oscillator.frequency.value = frequency
      oscillator.connect(gain)
      oscillator.start(start + index * 0.28)
      oscillator.stop(start + index * 0.28 + 0.24)
    })
    statusElement.textContent = 'Alarma activa · pulsa OK para detenerla'
  } catch (error) {
    statusElement.textContent = 'Haz clic en cualquier parte para activar el sonido'
  }
}

function startRinging() {
  void ring()
  ringTimer = setInterval(() => void ring(), 1500)
}

async function stopAlarm() {
  if (stopped) return
  stopped = true
  clearInterval(ringTimer)
  if (audioContext) await audioContext.close().catch(() => undefined)
  await chrome.runtime.sendMessage({ action: 'ACKNOWLEDGE_REMINDER', id: reminderId })
  window.close()
}

document.addEventListener('pointerdown', () => {
  if (!stopped && audioContext?.state !== 'running') void ring()
}, { capture: true })
acknowledgeButton.addEventListener('click', () => void stopAlarm())
startRinging()

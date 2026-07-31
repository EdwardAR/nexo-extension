chrome.runtime.onMessage.addListener((message) => {
  if (message.target !== 'offscreen' || message.action !== 'PLAY_COMPLETION_SOUND') return

  const context = new AudioContext()
  const gain = context.createGain()
  gain.gain.setValueAtTime(0.0001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.22, context.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.65)
  gain.connect(context.destination)

  ;[659.25, 783.99, 1046.5].forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    oscillator.connect(gain)
    oscillator.start(context.currentTime + index * 0.14)
    oscillator.stop(context.currentTime + index * 0.14 + 0.22)
  })

  setTimeout(() => context.close(), 900)
})

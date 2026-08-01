chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.target !== 'offscreen') return
  if (!['PLAY_COMPLETION_SOUND', 'PLAY_REMINDER_SOUND'].includes(message.action)) return

  const play = async () => {
    const context = new AudioContext()
    await context.resume()
    const gain = context.createGain()
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.48, context.currentTime + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.25)
    gain.connect(context.destination)

    const frequencies = message.action === 'PLAY_REMINDER_SOUND'
      ? [880, 659.25, 880, 1046.5, 880]
      : [659.25, 783.99, 1046.5]

    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      oscillator.type = index % 2 === 0 ? 'sine' : 'triangle'
      oscillator.frequency.value = frequency
      oscillator.connect(gain)
      oscillator.start(context.currentTime + index * 0.2)
      oscillator.stop(context.currentTime + index * 0.2 + 0.34)
    })

    await new Promise((resolve) => setTimeout(resolve, 1600))
    await context.close()
  }

  void play()
    .then(() => sendResponse({ success: true }))
    .catch((error) => sendResponse({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }))
  return true
})

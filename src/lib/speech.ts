let voicesReady = false

function ensureVoices(): void {
  if (voicesReady) return
  voicesReady = true
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.getVoices()
  speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices()
  }
}

export function speakKannada(text: string, slow = false): void {
  if (typeof window === 'undefined' || typeof speechSynthesis === 'undefined') return
  ensureVoices()
  speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'kn-IN'
  utter.rate = slow ? 0.55 : 0.82
  utter.pitch = 1.05
  const voices = speechSynthesis.getVoices()
  const kn =
    voices.find((v) => v.lang.toLowerCase().startsWith('kn')) ??
    voices.find((v) => /kannada/i.test(v.name))
  if (kn) utter.voice = kn
  speechSynthesis.speak(utter)
}

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

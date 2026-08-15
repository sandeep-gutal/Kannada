import { PROFILE_LIST } from '../data/profiles'
import type { ProfileId } from '../types'

export function profileForPin(pin: string): ProfileId | null {
  const code = pin.replace(/\D/g, '')
  if (code.length !== 2) return null
  const found = PROFILE_LIST.find((p) => p.pin === code)
  return found ? found.id : null
}

export function isValidPin(pin: string | null | undefined): boolean {
  return profileForPin(pin ?? '') !== null
}

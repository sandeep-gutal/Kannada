import { profileForPin } from './pins'
import type { ProfileId } from '../types'

export const AUTH_KEY = 'kali-kannada-auth-v1'

export type AuthSession = { pin: string; profileId: ProfileId }

export function loadAuth(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSession
    if (profileForPin(parsed.pin) === parsed.profileId) return parsed
    return null
  } catch {
    return null
  }
}

export function saveAuth(session: AuthSession): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session))
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY)
}

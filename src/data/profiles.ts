import type { ProfileDef, ProfileId } from '../types'

export const PROFILE_LIST: ProfileDef[] = [
  {
    id: 'riddhi',
    name: 'Riddhi',
    emoji: '🌸',
    color: '#FF82BF',
    blurb: 'Grade 2 learner · follow the path',
    canJump: false,
    outfit: 'chikki',
    pin: '01',
  },
  {
    id: 'siddhi',
    name: 'Siddhi',
    emoji: '🌼',
    color: '#FFC800',
    blurb: 'Grade 2 learner · follow the path',
    canJump: false,
    outfit: 'gold',
    pin: '02',
  },
  {
    id: 'sandeep',
    name: 'Sandeep',
    emoji: '🦁',
    color: '#1CB0F6',
    blurb: 'Parent · jump to any lesson',
    canJump: true,
    outfit: 'mysore',
    pin: '03',
  },
  {
    id: 'pragati',
    name: 'Pragati',
    emoji: '🌟',
    color: '#CE82FF',
    blurb: 'Parent · jump to any lesson',
    canJump: true,
    outfit: 'gold',
    pin: '04',
  },
]

export const PROFILE_IDS: ProfileId[] = PROFILE_LIST.map((p) => p.id)

export function getProfileDef(id: ProfileId): ProfileDef {
  const found = PROFILE_LIST.find((p) => p.id === id)
  if (!found) return PROFILE_LIST[0]!
  return found
}

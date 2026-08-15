import { getProfileDef, PROFILE_IDS, PROFILE_LIST } from '../data/profiles'
import type { AppMemory, ProfileId, Progress } from '../types'

export const STORAGE_KEY = 'kali-kannada-nps-varthur-v2'
const HEART_MS = 20 * 60 * 1000

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function emptyProgress(id: ProfileId): Progress {
  const def = getProfileDef(id)
  return {
    profileId: id,
    xp: 0,
    gems: 999999,
    hearts: 99,
    heartsAt: Date.now(),
    streak: 0,
    lastActive: '',
    completed: [],
    perfect: [],
    mistakes: [],
    outfit: def.outfit,
    name: def.name,
    dailyXp: 0,
    dailyDate: today(),
    goal: 50,
    unlimited: true,
    canJump: def.canJump,
  }
}

export function emptyMemory(): AppMemory {
  const profiles = {} as AppMemory['profiles']
  for (const def of PROFILE_LIST) {
    profiles[def.id] = emptyProgress(def.id)
  }
  return { activeId: null, profiles }
}

function refillHearts(p: Progress): Progress {
  if (p.unlimited) return { ...p, hearts: 99, gems: Math.max(p.gems, 999999) }
  if (p.hearts >= 5) return { ...p, heartsAt: Date.now() }
  const gained = Math.floor((Date.now() - p.heartsAt) / HEART_MS)
  if (gained <= 0) return p
  return {
    ...p,
    hearts: Math.min(5, p.hearts + gained),
    heartsAt: p.heartsAt + gained * HEART_MS,
  }
}

function rollStreak(p: Progress): Progress {
  if (!p.lastActive) return p
  const last = new Date(p.lastActive + 'T12:00:00')
  const now = new Date()
  const diff = Math.floor((now.getTime() - last.getTime()) / 86400000)
  if (diff <= 1) return p
  return { ...p, streak: 0 }
}

function normalizeProgress(id: ProfileId, raw: Partial<Progress> | undefined): Progress {
  const base = emptyProgress(id)
  const merged = { ...base, ...raw, profileId: id, name: base.name, unlimited: true, canJump: base.canJump }
  let next = refillHearts(merged)
  next = rollStreak(next)
  if (next.dailyDate !== today()) {
    next = { ...next, dailyDate: today(), dailyXp: 0 }
  }
  return next
}

export function loadMemory(): AppMemory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyMemory()
    const parsed = JSON.parse(raw) as Partial<AppMemory>
    return normalizeMemory(parsed)
  } catch {
    return emptyMemory()
  }
}

export function normalizeMemory(parsed: Partial<AppMemory> | null | undefined): AppMemory {
  const profiles = {} as AppMemory['profiles']
  for (const id of PROFILE_IDS) {
    profiles[id] = normalizeProgress(id, parsed?.profiles?.[id])
  }
  const activeId = parsed?.activeId && PROFILE_IDS.includes(parsed.activeId) ? parsed.activeId : null
  return { activeId, profiles }
}

function unique(items: string[]): string[] {
  return [...new Set(items)]
}

export function mergeProgress(a: Progress, b: Progress): Progress {
  const aTime = a.lastActive || ''
  const bTime = b.lastActive || ''
  const newer = aTime >= bTime ? a : b
  const older = newer === a ? b : a
  return {
    ...newer,
    xp: Math.max(a.xp, b.xp),
    streak: Math.max(a.streak, b.streak),
    dailyDate: newer.dailyDate || older.dailyDate,
    dailyXp:
      a.dailyDate === b.dailyDate
        ? Math.max(a.dailyXp, b.dailyXp)
        : newer.dailyXp,
    completed: unique([...a.completed, ...b.completed]),
    perfect: unique([...a.perfect, ...b.perfect]),
    mistakes: a.mistakes.length >= b.mistakes.length ? a.mistakes : b.mistakes,
    gems: Math.max(a.gems, b.gems),
    hearts: Math.max(a.hearts, b.hearts),
  }
}

export function mergeMemory(a: AppMemory, b: AppMemory): AppMemory {
  const profiles = {} as AppMemory['profiles']
  for (const id of PROFILE_IDS) {
    profiles[id] = mergeProgress(a.profiles[id], b.profiles[id])
  }
  return { activeId: b.activeId ?? a.activeId, profiles }
}

export function saveMemory(memory: AppMemory): AppMemory {
  let merged = memory
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      merged = mergeMemory(normalizeMemory(JSON.parse(raw) as Partial<AppMemory>), memory)
    }
  } catch {
    merged = memory
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  return merged
}

export function exportBackup(memory: AppMemory): string {
  const payload = JSON.stringify({
    v: 1,
    savedAt: new Date().toISOString(),
    memory,
  })
  return `KALI1.${btoa(unescape(encodeURIComponent(payload)))}`
}

export function importBackup(text: string): AppMemory | null {
  const trimmed = text.trim()
  try {
    let json = trimmed
    if (trimmed.startsWith('KALI1.')) {
      json = decodeURIComponent(escape(atob(trimmed.slice(6))))
    }
    const parsed = JSON.parse(json) as { memory?: Partial<AppMemory> } & Partial<AppMemory>
    const incoming = parsed.memory ?? parsed
    if (!incoming.profiles) return null
    return normalizeMemory(incoming)
  } catch {
    return null
  }
}

export function applyLessonComplete(
  p: Progress,
  lessonId: string,
  xp: number,
  perfect: boolean,
): Progress {
  const already = p.completed.includes(lessonId)
  const gems = p.unlimited ? p.gems : p.gems + (already ? 2 : 10) + (perfect ? 5 : 0)
  const last = p.lastActive
  let streak = p.streak
  const t = today()
  if (last !== t) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const y = yesterday.toISOString().slice(0, 10)
    streak = last === y || last === '' ? p.streak + 1 : 1
  }
  return {
    ...p,
    xp: p.xp + xp,
    gems,
    completed: already ? p.completed : [...p.completed, lessonId],
    perfect: perfect && !p.perfect.includes(lessonId) ? [...p.perfect, lessonId] : p.perfect,
    lastActive: t,
    streak,
    dailyXp: p.dailyDate === t ? p.dailyXp + xp : xp,
    dailyDate: t,
  }
}

export function loseHeart(p: Progress): Progress {
  if (p.unlimited) return p
  const filled = refillHearts(p)
  return {
    ...filled,
    hearts: Math.max(0, filled.hearts - 1),
    heartsAt: filled.hearts === 5 ? Date.now() : filled.heartsAt,
  }
}

export function rememberMistake(
  p: Progress,
  item: { kn: string; en: string; rom: string },
): Progress {
  const next = p.mistakes.filter((m) => m.kn !== item.kn)
  next.unshift(item)
  return { ...p, mistakes: next.slice(0, 40) }
}

export function currentLessonTitle(completed: string[], lessonTitles: { id: string; title: string }[]): string {
  const next = lessonTitles.find((l) => !completed.includes(l.id))
  if (!next) return 'Path complete'
  return next.title
}

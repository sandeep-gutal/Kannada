import type { Progress } from '../types'

const KEY = 'kali-kannada-nps-varthur-v1'
const HEART_MS = 20 * 60 * 1000

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function emptyProgress(): Progress {
  return {
    xp: 0,
    gems: 0,
    hearts: 5,
    heartsAt: Date.now(),
    streak: 0,
    lastActive: '',
    completed: [],
    perfect: [],
    mistakes: [],
    outfit: 'chikki',
    name: 'Learner',
    dailyXp: 0,
    dailyDate: today(),
    goal: 50,
  }
}

function refillHearts(p: Progress): Progress {
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

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProgress()
    const parsed = { ...emptyProgress(), ...(JSON.parse(raw) as Progress) }
    let next = refillHearts(parsed)
    next = rollStreak(next)
    if (next.dailyDate !== today()) {
      next = { ...next, dailyDate: today(), dailyXp: 0 }
    }
    return next
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(p: Progress): void {
  localStorage.setItem(KEY, JSON.stringify(p))
}

export function applyLessonComplete(
  p: Progress,
  lessonId: string,
  xp: number,
  perfect: boolean,
): Progress {
  const already = p.completed.includes(lessonId)
  const gems = (already ? 2 : 10) + (perfect ? 5 : 0)
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
    gems: p.gems + gems,
    completed: already ? p.completed : [...p.completed, lessonId],
    perfect: perfect && !p.perfect.includes(lessonId) ? [...p.perfect, lessonId] : p.perfect,
    lastActive: t,
    streak,
    dailyXp: p.dailyDate === t ? p.dailyXp + xp : xp,
    dailyDate: t,
  }
}

export function loseHeart(p: Progress): Progress {
  const filled = refillHearts(p)
  return {
    ...filled,
    hearts: Math.max(0, filled.hearts - 1),
    heartsAt: filled.hearts === 5 ? Date.now() : filled.heartsAt,
  }
}

export function buyHearts(p: Progress): Progress | null {
  if (p.gems < 40 || p.hearts >= 5) return null
  return { ...p, gems: p.gems - 40, hearts: 5, heartsAt: Date.now() }
}

export function rememberMistake(
  p: Progress,
  item: { kn: string; en: string; rom: string },
): Progress {
  const next = p.mistakes.filter((m) => m.kn !== item.kn)
  next.unshift(item)
  return { ...p, mistakes: next.slice(0, 40) }
}

export function msToNextHeart(p: Progress): number {
  if (p.hearts >= 5) return 0
  return Math.max(0, HEART_MS - (Date.now() - p.heartsAt))
}

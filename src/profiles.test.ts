import { describe, expect, it } from 'vitest'
import { ALL_LESSONS, isUnlocked } from './data/curriculum'
import { PROFILE_LIST } from './data/profiles'
import {
  applyLessonComplete,
  emptyMemory,
  emptyProgress,
  exportBackup,
  importBackup,
  loseHeart,
  saveMemory,
  loadMemory,
} from './lib/progress'

describe('family profiles', () => {
  it('defines Riddhi, Siddhi, Sandeep, and Pragati', () => {
    expect(PROFILE_LIST.map((p) => p.name)).toEqual(['Riddhi', 'Siddhi', 'Sandeep', 'Pragati'])
  })

  it('gives every profile unlimited hearts and gems', () => {
    for (const p of PROFILE_LIST) {
      const progress = emptyProgress(p.id)
      expect(progress.unlimited).toBe(true)
      expect(loseHeart(progress).hearts).toBe(progress.hearts)
      expect(progress.gems).toBeGreaterThan(1000)
    }
  })

  it('lets only Sandeep and Pragati jump any lesson', () => {
    const later = ALL_LESSONS[8]
    expect(later).toBeTruthy()
    expect(isUnlocked(later!.id, [], false)).toBe(false)
    expect(isUnlocked(later!.id, [], true)).toBe(true)
    expect(emptyProgress('sandeep').canJump).toBe(true)
    expect(emptyProgress('pragati').canJump).toBe(true)
    expect(emptyProgress('riddhi').canJump).toBe(false)
    expect(emptyProgress('siddhi').canJump).toBe(false)
  })

  it('saves each profile’s progress in app memory', () => {
    const memory = emptyMemory()
    const first = ALL_LESSONS[0]
    expect(first).toBeTruthy()
    memory.profiles.riddhi = applyLessonComplete(memory.profiles.riddhi, first!.id, 15, true)
    memory.activeId = 'riddhi'
    saveMemory(memory)
    const loaded = loadMemory()
    expect(loaded.activeId).toBe('riddhi')
    expect(loaded.profiles.riddhi.completed).toContain(first!.id)
    expect(loaded.profiles.siddhi.completed).toEqual([])
    expect(loaded.profiles.sandeep.name).toBe('Sandeep')
    expect(loaded.profiles.pragati.name).toBe('Pragati')
  })

  it('does not let an empty tab wipe a completed lesson', () => {
    const first = ALL_LESSONS[0]!
    const filled = emptyMemory()
    filled.profiles.riddhi = applyLessonComplete(filled.profiles.riddhi, first.id, 15, true)
    saveMemory(filled)
    saveMemory(emptyMemory())
    const loaded = loadMemory()
    expect(loaded.profiles.riddhi.completed).toContain(first.id)
    expect(loaded.profiles.riddhi.xp).toBeGreaterThanOrEqual(15)
  })

  it('round-trips a family backup code', () => {
    const first = ALL_LESSONS[0]!
    const memory = emptyMemory()
    memory.profiles.siddhi = applyLessonComplete(memory.profiles.siddhi, first.id, 12, false)
    const code = exportBackup(memory)
    const restored = importBackup(code)
    expect(restored?.profiles.siddhi.completed).toContain(first.id)
  })
})

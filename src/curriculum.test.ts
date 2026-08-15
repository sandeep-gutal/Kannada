import { describe, expect, it } from 'vitest'
import { ALL_LESSONS, isUnlocked, UNITS } from './data/curriculum'
import { SWARAS, VYANJANAS } from './data/letters'
import { sameAnswer } from './lib/quiz'

describe('Kali Grade 2 curriculum', () => {
  it('has a full NPS-aligned path', () => {
    expect(UNITS.length).toBeGreaterThanOrEqual(15)
    expect(ALL_LESSONS.length).toBeGreaterThanOrEqual(30)
  })

  it('uses unique lesson ids', () => {
    const ids = ALL_LESSONS.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('unlocks the first lesson and gates the rest', () => {
    const first = ALL_LESSONS[0]
    expect(first).toBeTruthy()
    expect(isUnlocked(first!.id, [])).toBe(true)
    expect(isUnlocked(ALL_LESSONS[1]!.id, [])).toBe(false)
    expect(isUnlocked(ALL_LESSONS[1]!.id, [first!.id])).toBe(true)
    expect(isUnlocked(ALL_LESSONS[1]!.id, [], true)).toBe(true)
  })

  it('gives every lesson exercises with valid answers', () => {
    for (const lesson of ALL_LESSONS) {
      expect(lesson.exercises.length).toBeGreaterThan(0)
      for (const ex of lesson.exercises) {
        if (ex.kind === 'choice') {
          expect(ex.options.some((o) => o.kn === ex.correctKn)).toBe(true)
          expect(ex.options.length).toBeGreaterThan(0)
        }
        if (ex.kind === 'match') {
          expect(ex.pairs.length).toBeGreaterThanOrEqual(2)
        }
        if (ex.kind === 'tiles') {
          expect((ex.word.parts ?? [ex.word.kn]).join('').length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('includes Kannada vowels and consonants', () => {
    expect(SWARAS.map((s) => s.kn)).toContain('ಅ')
    expect(SWARAS.map((s) => s.kn)).toContain('ಐ')
    expect(VYANJANAS.map((s) => s.kn)).toContain('ಳ')
    expect(VYANJANAS.length).toBe(34)
  })

  it('covers Kali Kannada Grade 2 themes', () => {
    const blob = UNITS.flatMap((u) => [u.title, u.titleKn, u.description])
      .concat(ALL_LESSONS.flatMap((l) => [l.title, l.titleKn, l.blurb]))
      .join(' ')
    expect(blob).toMatch(/ನಮಸ್ಕಾರ/)
    expect(blob).toMatch(/ಬಾವುಟ/)
    expect(blob).toMatch(/ಕಾಗುಣಿತ/)
    expect(blob).toMatch(/Varthur|NPS|Kali Kannada/)
  })

  it('normalizes answers', () => {
    expect(sameAnswer('ನ ಮ', 'ನಮ')).toBe(true)
  })
})

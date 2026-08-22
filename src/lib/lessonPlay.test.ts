import { describe, expect, it } from 'vitest'
import { removeTileAt, removeTileByBankIndex, resolveMatchTap } from './lessonPlay'

describe('tile unselect', () => {
  it('removes one built syllable and frees that bank tile', () => {
    const next = removeTileAt(['ನೀ', 'ಸ್ತೇ', 'ನಾ', 'ನು'], [0, 1, 3, 4], 1)
    expect(next.picks).toEqual(['ನೀ', 'ನಾ', 'ನು'])
    expect(next.usedBankIndexes).toEqual([0, 3, 4])
  })

  it('unselects by tapping the used bank tile', () => {
    const next = removeTileByBankIndex(['ನೀ', 'ನಾ'], [0, 3], 0)
    expect(next.picks).toEqual(['ನಾ'])
    expect(next.usedBankIndexes).toEqual([3])
  })
})

describe('match after a miss', () => {
  it('does not lock remaining pairs on a wrong tap', () => {
    const miss = resolveMatchTap('ನಾನು', 'ನೀನು', ['ಹಲೋ'], 3)
    expect(miss.result).toBe('miss')
    expect(miss.matched).toEqual(['ಹಲೋ'])
    expect(miss.allMatched).toBe(false)

    const hit = resolveMatchTap('ನಾನು', 'ನಾನು', miss.matched, 3)
    expect(hit.result).toBe('hit')
    expect(hit.matched).toEqual(['ಹಲೋ', 'ನಾನು'])
    expect(hit.allMatched).toBe(false)
  })

  it('completes only after every pair is matched', () => {
    const last = resolveMatchTap('ನೀನು', 'ನೀನು', ['ಹಲೋ', 'ನಾನು'], 3)
    expect(last.result).toBe('hit')
    expect(last.allMatched).toBe(true)
  })
})

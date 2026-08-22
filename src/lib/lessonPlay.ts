/** Remove one selected tile (by position in the built word) and free its bank slot. */
export function removeTileAt(
  picks: string[],
  usedBankIndexes: number[],
  pickIndex: number,
): { picks: string[]; usedBankIndexes: number[] } {
  if (pickIndex < 0 || pickIndex >= picks.length) {
    return { picks, usedBankIndexes }
  }
  return {
    picks: picks.filter((_, i) => i !== pickIndex),
    usedBankIndexes: usedBankIndexes.filter((_, i) => i !== pickIndex),
  }
}

/** Tap a used bank tile to put that syllable back. */
export function removeTileByBankIndex(
  picks: string[],
  usedBankIndexes: number[],
  bankIndex: number,
): { picks: string[]; usedBankIndexes: number[] } {
  return removeTileAt(picks, usedBankIndexes, usedBankIndexes.indexOf(bankIndex))
}

export type MatchTapResult = {
  matched: string[]
  leftPick: string | null
  result: 'need-left' | 'hit' | 'miss'
  allMatched: boolean
}

/** Pair a selected left item with a right item without locking remaining pairs. */
export function resolveMatchTap(
  leftPick: string | null,
  rightKn: string,
  matched: string[],
  pairCount: number,
): MatchTapResult {
  if (!leftPick) {
    return { matched, leftPick, result: 'need-left', allMatched: false }
  }
  if (leftPick === rightKn) {
    const next = [...matched, rightKn]
    return {
      matched: next,
      leftPick: null,
      result: 'hit',
      allMatched: next.length === pairCount,
    }
  }
  return { matched, leftPick: null, result: 'miss', allMatched: false }
}

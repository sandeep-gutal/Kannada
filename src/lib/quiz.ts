export function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = copy[i]
    const b = copy[j]
    if (a === undefined || b === undefined) continue
    copy[i] = b
    copy[j] = a
  }
  return copy
}

export function pickDistractors<T extends { kn: string }>(
  pool: T[],
  correctKn: string,
  count: number,
): T[] {
  return shuffle(pool.filter((item) => item.kn !== correctKn)).slice(0, count)
}

export function sameAnswer(a: string, b: string): boolean {
  return a.replace(/\s+/g, '') === b.replace(/\s+/g, '')
}

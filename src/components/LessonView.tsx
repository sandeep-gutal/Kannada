import { useEffect, useMemo, useState } from 'react'
import type { Lesson, Word } from '../types'
import { speakKannada } from '../lib/speech'
import { sameAnswer, shuffle } from '../lib/quiz'
import { removeTileAt, removeTileByBankIndex, resolveMatchTap } from '../lib/lessonPlay'
import { Mascot } from './Mascot'

type Props = {
  lesson: Lesson
  hearts: number
  unlimited?: boolean
  onExit: () => void
  onCorrect: () => void
  onWrong: (word: { kn: string; en: string; rom: string }) => void
  onComplete: (mistakes: number) => void
  onOutOfHearts: () => void
}

function optionLabel(word: Word, showKn: boolean): string {
  return showKn ? word.kn : word.en
}

export function LessonView({
  lesson,
  hearts,
  unlimited = false,
  onExit,
  onCorrect,
  onWrong,
  onComplete,
  onOutOfHearts,
}: Props) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [ok, setOk] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [tilePicks, setTilePicks] = useState<string[]>([])
  const [usedTiles, setUsedTiles] = useState<number[]>([])
  const [leftPick, setLeftPick] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [matchMissed, setMatchMissed] = useState(false)
  const [mismatch, setMismatch] = useState<{ left: string; right: string } | null>(null)
  const [tfPick, setTfPick] = useState<boolean | null>(null)

  const ex = lesson.exercises[i]
  const total = lesson.exercises.length
  const pct = Math.round((i / total) * 100)

  const tileBank = useMemo(() => {
    if (!ex || ex.kind !== 'tiles') return []
    return shuffle([...(ex.word.parts ?? [ex.word.kn]), ...ex.extraParts])
  }, [ex])

  const matchCols = useMemo(() => {
    if (!ex || ex.kind !== 'match') return { left: [] as Word[], right: [] as Word[] }
    return { left: shuffle(ex.pairs), right: shuffle(ex.pairs) }
  }, [ex])

  useEffect(() => {
    if (!mismatch) return
    const id = window.setTimeout(() => setMismatch(null), 450)
    return () => window.clearTimeout(id)
  }, [mismatch])

  if (!ex) return null

  const applyMistake = (word?: { kn: string; en: string; rom: string }) => {
    setMistakes((m) => m + 1)
    if (word) onWrong(word)
    if (!unlimited && hearts <= 1) {
      onOutOfHearts()
    }
  }

  const finishCheck = (correct: boolean, word?: { kn: string; en: string; rom: string }) => {
    setChecked(true)
    setOk(correct)
    if (correct) {
      onCorrect()
      return
    }
    applyMistake(word)
  }

  const unselectTileAt = (pickIndex: number) => {
    if (checked) return
    const nextTiles = removeTileAt(tilePicks, usedTiles, pickIndex)
    setTilePicks(nextTiles.picks)
    setUsedTiles(nextTiles.usedBankIndexes)
  }

  const unselectBankTile = (bankIndex: number) => {
    if (checked) return
    const nextTiles = removeTileByBankIndex(tilePicks, usedTiles, bankIndex)
    setTilePicks(nextTiles.picks)
    setUsedTiles(nextTiles.usedBankIndexes)
  }

  const next = () => {
    if (i + 1 >= total) {
      onComplete(mistakes + (ok ? 0 : 0))
      return
    }
    setI((n) => n + 1)
    setPicked(null)
    setChecked(false)
    setOk(false)
    setTilePicks([])
    setUsedTiles([])
    setLeftPick(null)
    setMatched([])
    setMatchMissed(false)
    setMismatch(null)
    setTfPick(null)
  }

  const showKnOptions = ex.kind === 'choice' && ex.promptLang !== 'kn'

  return (
    <div className="lesson">
      <header className="lesson-bar">
        <button className="icon-btn" onClick={onExit} aria-label="Close">
          ✕
        </button>
        <div className="xp-track">
          <div className="xp-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="hearts">❤ {unlimited ? '∞' : hearts}</div>
      </header>

      <p className="instruction">{ex.instruction}</p>

      {ex.kind === 'teach' && (
        <div className="teach card">
          <Mascot mood="think" />
          <button className="glyph" onClick={() => speakKannada(ex.word.kn)}>
            {ex.word.emoji} {ex.word.kn}
          </button>
          <p className="rom">{ex.word.rom}</p>
          <p className="en">{ex.word.en}</p>
          {ex.note && <p className="note">{ex.note}</p>}
          <div className="row">
            <button className="ghost" onClick={() => speakKannada(ex.word.kn, true)}>
              Slow
            </button>
            <button className="ghost" onClick={() => speakKannada(ex.word.kn)}>
              Hear again
            </button>
          </div>
        </div>
      )}

      {ex.kind === 'choice' && (
        <div className="prompt-block">
          <button
            className="speaker"
            onClick={() => speakKannada(ex.speak ?? ex.prompt)}
            aria-label="Play audio"
          >
            🔊
          </button>
          <div className={ex.promptLang === 'kn' ? 'glyph sm' : 'prompt-en'}>{ex.prompt}</div>
          <div className="options">
            {ex.options.map((opt) => {
              const selected = picked === opt.kn
              let cls = 'choice'
              if (checked && opt.kn === ex.correctKn) cls += ' good'
              if (checked && selected && opt.kn !== ex.correctKn) cls += ' bad'
              if (selected && !checked) cls += ' on'
              return (
                <button
                  key={opt.kn + opt.en}
                  className={cls}
                  disabled={checked}
                  onClick={() => {
                    setPicked(opt.kn)
                    speakKannada(opt.kn)
                  }}
                >
                  <span className="emoji">{opt.emoji}</span>
                  <span>{optionLabel(opt, showKnOptions)}</span>
                  {!showKnOptions && <small>{opt.rom}</small>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {ex.kind === 'tiles' && (
        <div className="tiles-ex">
          <p className="prompt-en">
            {ex.word.emoji} {ex.word.en}
          </p>
          <button className="ghost" onClick={() => speakKannada(ex.word.kn)}>
            🔊 Hint audio
          </button>
          <div className="built">
            {tilePicks.length === 0 ? (
              <span className="ph">Tap letters below</span>
            ) : (
              tilePicks.map((part, pickIndex) => (
                <button
                  key={`${part}-${usedTiles[pickIndex]}-${pickIndex}`}
                  type="button"
                  className="built-chip"
                  disabled={checked}
                  aria-label={`Remove ${part}`}
                  onClick={() => unselectTileAt(pickIndex)}
                >
                  {part}
                </button>
              ))
            )}
          </div>
          <div className="tiles">
            {tileBank.map((part, idx) => {
              const used = usedTiles.includes(idx)
              return (
                <button
                  key={part + idx}
                  className={'tile' + (used ? ' used' : '')}
                  disabled={checked}
                  aria-label={used ? `Unselect ${part}` : `Add ${part}`}
                  onClick={() => {
                    if (used) {
                      unselectBankTile(idx)
                      return
                    }
                    setUsedTiles((u) => [...u, idx])
                    setTilePicks((t) => [...t, part])
                  }}
                >
                  {part}
                </button>
              )
            })}
          </div>
          <button
            className="ghost"
            disabled={checked}
            onClick={() => {
              setTilePicks([])
              setUsedTiles([])
            }}
          >
            Clear
          </button>
        </div>
      )}

      {ex.kind === 'match' && (
        <div className="match">
          <div className="col">
            {matchCols.left.map((w) => (
              <button
                key={'L' + w.kn}
                className={
                  'choice' +
                  (matched.includes(w.kn) ? ' good' : '') +
                  (leftPick === w.kn ? ' on' : '') +
                  (mismatch?.left === w.kn ? ' bad' : '')
                }
                disabled={matched.includes(w.kn) || checked}
                onClick={() => {
                  speakKannada(w.kn)
                  setLeftPick((current) => (current === w.kn ? null : w.kn))
                }}
              >
                {w.kn}
              </button>
            ))}
          </div>
          <div className="col">
            {matchCols.right.map((w) => (
              <button
                key={'R' + w.kn}
                className={
                  'choice' +
                  (matched.includes(w.kn) ? ' good' : '') +
                  (mismatch?.right === w.kn ? ' bad' : '')
                }
                disabled={matched.includes(w.kn) || checked}
                onClick={() => {
                  const outcome = resolveMatchTap(leftPick, w.kn, matched, ex.pairs.length)
                  if (outcome.result === 'need-left') return
                  setLeftPick(outcome.leftPick)
                  setMatched(outcome.matched)
                  if (outcome.result === 'miss') {
                    setMatchMissed(true)
                    setMismatch({ left: leftPick!, right: w.kn })
                    applyMistake({ kn: w.kn, en: w.en, rom: w.rom })
                    return
                  }
                  if (outcome.allMatched) {
                    if (matchMissed) {
                      setChecked(true)
                      setOk(false)
                    } else {
                      finishCheck(true)
                    }
                  }
                }}
              >
                {w.emoji} {w.en}
              </button>
            ))}
          </div>
        </div>
      )}

      {ex.kind === 'truefalse' && (
        <div className="tf">
          {ex.speak && (
            <button className="speaker" onClick={() => speakKannada(ex.speak!)}>
              🔊
            </button>
          )}
          <p className="statement">{ex.statement}</p>
          <div className="row">
            <button
              className={'choice' + (tfPick === true ? ' on' : '') + (checked && ex.correct ? ' good' : '')}
              disabled={checked}
              onClick={() => setTfPick(true)}
            >
              True
            </button>
            <button
              className={
                'choice' +
                (tfPick === false ? ' on' : '') +
                (checked && !ex.correct ? ' good' : '')
              }
              disabled={checked}
              onClick={() => setTfPick(false)}
            >
              False
            </button>
          </div>
        </div>
      )}

      {checked && (
        <div className={'banner ' + (ok ? 'ok' : 'no')}>
          <Mascot mood={ok ? 'cheer' : 'oops'} />
          <div>
            <strong>{ok ? 'Correct!' : 'Not quite'}</strong>
            {ex.kind === 'truefalse' && <p>{ex.explain}</p>}
            {ex.kind === 'choice' && (
              <p>
                {ex.options.find((o) => o.kn === ex.correctKn)?.kn} —{' '}
                {ex.options.find((o) => o.kn === ex.correctKn)?.rom} —{' '}
                {ex.options.find((o) => o.kn === ex.correctKn)?.en}
              </p>
            )}
            {ex.kind === 'match' && (
              <p>{ok ? 'All pairs matched.' : 'A mismatch cost a try, but you could still finish the rest.'}</p>
            )}
          </div>
        </div>
      )}

      <footer className="lesson-foot">
        {ex.kind === 'teach' && (
          <button className="cta" onClick={next}>
            Continue
          </button>
        )}
        {ex.kind !== 'teach' && !checked && ex.kind !== 'match' && (
          <button
            className="cta"
            disabled={
              (ex.kind === 'choice' && !picked) ||
              (ex.kind === 'tiles' && tilePicks.length === 0) ||
              (ex.kind === 'truefalse' && tfPick === null)
            }
            onClick={() => {
              if (ex.kind === 'choice' && picked) {
                finishCheck(picked === ex.correctKn, ex.options.find((o) => o.kn === picked))
              } else if (ex.kind === 'tiles') {
                const built = tilePicks.join('')
                const target = (ex.word.parts ?? [ex.word.kn]).join('')
                finishCheck(sameAnswer(built, target) || sameAnswer(built, ex.word.kn), ex.word)
              } else if (ex.kind === 'truefalse' && tfPick !== null) {
                finishCheck(tfPick === ex.correct)
              }
            }}
          >
            Check
          </button>
        )}
        {checked && (
          <button className="cta" onClick={next}>
            {i + 1 >= total ? 'Finish' : 'Continue'}
          </button>
        )}
      </footer>
    </div>
  )
}

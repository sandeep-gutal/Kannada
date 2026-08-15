import { useEffect, useMemo, useState } from 'react'
import { ALL_LESSONS, getLesson, isUnlocked, STORIES, UNITS } from './data/curriculum'
import { SWARAS, VYANJANAS } from './data/letters'
import { LessonView } from './components/LessonView'
import { Mascot } from './components/Mascot'
import {
  applyLessonComplete,
  buyHearts,
  loadProgress,
  loseHeart,
  rememberMistake,
  saveProgress,
} from './lib/progress'
import { speakKannada } from './lib/speech'
import { shuffle } from './lib/quiz'
import type { Progress, Screen } from './types'
import './app-ui.css'

function league(xp: number): string {
  if (xp >= 800) return 'Gold league'
  if (xp >= 300) return 'Silver league'
  return 'Bronze league'
}

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress())
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [tab, setTab] = useState<'learn' | 'stories' | 'letters' | 'profile'>('learn')
  const [practiceLesson, setPracticeLesson] = useState<(typeof ALL_LESSONS)[0] | null>(null)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const completedSet = useMemo(() => new Set(progress.completed), [progress.completed])
  const doneCount = progress.completed.length
  const totalLessons = ALL_LESSONS.length

  const startLesson = (id: string) => {
    if (progress.hearts <= 0) {
      setScreen({ name: 'shop' })
      return
    }
    setScreen({ name: 'lesson', lessonId: id })
  }

  const startPractice = () => {
    const pool = ALL_LESSONS.filter((l) => completedSet.has(l.id) || l.id === ALL_LESSONS[0]?.id)
    const src = shuffle(pool).slice(0, 3)
    const exercises = shuffle(src.flatMap((l) => l.exercises.filter((e) => e.kind !== 'teach'))).slice(
      0,
      8,
    )
    const lesson = {
      id: 'practice',
      title: 'Practice',
      titleKn: 'ಅಭ್ಯಾಸ',
      blurb: 'A mix of what you have learned',
      xp: 10,
      exercises,
    }
    setPracticeLesson(lesson)
    setScreen({ name: 'lesson', lessonId: 'practice' })
  }

  const activeLesson =
    screen.name === 'lesson'
      ? screen.lessonId === 'practice'
        ? practiceLesson
        : getLesson(screen.lessonId)
      : undefined

  return (
    <div className="shell">
      {screen.name === 'lesson' && activeLesson && (
        <LessonView
          lesson={activeLesson}
          hearts={progress.hearts}
          onExit={() => setScreen({ name: 'home' })}
          onCorrect={() => undefined}
          onWrong={(word) => {
            setProgress((p) => rememberMistake(loseHeart(p), word))
          }}
          onOutOfHearts={() => {
            setScreen({ name: 'shop' })
          }}
          onComplete={(mistakes) => {
            const xp = Math.max(5, activeLesson.xp - mistakes)
            const perfect = mistakes === 0
            setProgress((p) => {
              if (activeLesson.id === 'practice') {
                const t = new Date().toISOString().slice(0, 10)
                return {
                  ...p,
                  xp: p.xp + xp,
                  gems: p.gems + (perfect ? 4 : 2),
                  dailyXp: p.dailyDate === t ? p.dailyXp + xp : xp,
                  dailyDate: t,
                  lastActive: t,
                }
              }
              return applyLessonComplete(p, activeLesson.id, xp, perfect)
            })
            setScreen({
              name: 'result',
              lessonId: activeLesson.id,
              xp,
              perfect,
              mistakes,
            })
          }}
        />
      )}

      {screen.name === 'result' && (
        <div className="result">
          <Mascot mood="cheer" outfit={progress.outfit} />
          <h1>{screen.perfect ? 'Perfect lesson!' : 'Lesson complete'}</h1>
          <p className="rom">ಚೆನ್ನಾಗಿದೆ · chennagide · well done</p>
          <div className="stats">
            <div>
              <b>+{screen.xp}</b>
              <span>XP</span>
            </div>
            <div>
              <b>{screen.perfect ? '+15' : '+10'}</b>
              <span>Gems</span>
            </div>
            <div>
              <b>{screen.mistakes}</b>
              <span>Misses</span>
            </div>
          </div>
          <button className="cta" onClick={() => setScreen({ name: 'home' })}>
            Continue
          </button>
        </div>
      )}

      {screen.name === 'shop' && (
        <div className="page">
          <h1>Hearts & shop</h1>
          <p>Hearts refill over time. You can also refill with gems.</p>
          <p className="hearts big">❤ {progress.hearts} / 5</p>
          <p>💎 {progress.gems} gems</p>
          <button
            className="cta"
            onClick={() => {
              const next = buyHearts(progress)
              if (next) setProgress(next)
            }}
          >
            Refill hearts · 40 gems
          </button>
          <h2>Mascot outfits</h2>
          <div className="options">
            {[
              { id: 'chikki', name: 'Chikki green', cost: 0 },
              { id: 'gold', name: 'Mysore gold', cost: 50 },
              { id: 'mysore', name: 'Dasara red', cost: 80 },
            ].map((o) => (
              <button
                key={o.id}
                className={'choice' + (progress.outfit === o.id ? ' on' : '')}
                onClick={() => {
                  if (progress.outfit === o.id) return
                  if (o.cost === 0) setProgress({ ...progress, outfit: o.id })
                  else if (progress.gems >= o.cost)
                    setProgress({ ...progress, gems: progress.gems - o.cost, outfit: o.id })
                }}
              >
                {o.name} {o.cost ? `· ${o.cost}💎` : '· free'}
              </button>
            ))}
          </div>
          <button className="ghost" onClick={() => setScreen({ name: 'home' })}>
            Back
          </button>
        </div>
      )}

      {screen.name === 'guide' && (
        <div className="page prose">
          <h1>For parents & teachers</h1>
          <p>
            <strong>Kali</strong> is a Grade 2 Kannada path for non-native speakers at{' '}
            <strong>National Public School, Varthur</strong> (CBSE). NPS Bangalore schools teach
            Kannada as a new language with <em>Kali Kannada</em> (Parichaya Bhashe) Parts 1 & 2 —
            not first-language Savi Kannada.
          </p>
          <h2>What the path covers</h2>
          <ul>
            <li>Everyday talk: ನಮಸ್ಕಾರ, please, thank you, I / you (respectful ನೀವು)</li>
            <li>ಸ್ವರಗಳು (vowels) and ವ್ಯಂಜನಗಳು (consonants)</li>
            <li>Kali Kannada-2 akshara groups used in Part 2 letter lessons</li>
            <li>Family, school, numbers, colours, animals, food, body, home</li>
            <li>
              Poem <em>themes</em> from Kali Kannada-2: ನಂದನಾಮ (morning prayer), ನಮ್ಮ ಬಾವುಟ (our
              flag), rain, rainbow, harvest, and story values (kindness vs greed)
            </li>
            <li>ಕಾಗುಣಿತ (how ಕ joins vowels) and classroom sentences</li>
          </ul>
          <p>
            Textbook poems are not copied word-for-word. Children practise the same topics with
            original, simple lines, English meanings, and transliteration — the way a non-native
            Grade 2 learner needs.
          </p>
          <p>
            Audio uses the device’s Kannada voice (Chrome/Android usually include kn-IN). Sit with
            your child for the first week and tap 🔊 together.
          </p>
          <button className="cta" onClick={() => setScreen({ name: 'home' })}>
            Start learning
          </button>
        </div>
      )}

      {screen.name !== 'lesson' &&
        screen.name !== 'result' &&
        screen.name !== 'shop' &&
        screen.name !== 'guide' && (
          <>
            <header className="top">
              <div>
                <p className="kicker">NPS Varthur · CBSE Grade 2</p>
                <h1 className="brand">
                  ಕಲಿ <span>Kali</span>
                </h1>
              </div>
              <div className="hud">
                <span>🔥 {progress.streak}</span>
                <span>💎 {progress.gems}</span>
                <span>❤ {progress.hearts}</span>
              </div>
            </header>

            <div className="goal">
              <span>Daily goal</span>
              <div className="xp-track">
                <div
                  className="xp-fill"
                  style={{ width: `${Math.min(100, (progress.dailyXp / progress.goal) * 100)}%` }}
                />
              </div>
              <small>
                {progress.dailyXp}/{progress.goal} XP
              </small>
            </div>

            {tab === 'learn' && (
              <main className="path">
                {UNITS.map((unit) => (
                  <section key={unit.id} className="unit">
                    <div className="unit-head" style={{ background: unit.color }}>
                      <div>
                        <p>
                          Unit {unit.number} · {unit.titleKn}
                        </p>
                        <h2>{unit.title}</h2>
                        <small>{unit.description}</small>
                      </div>
                      <span className="unit-icon">{unit.icon}</span>
                    </div>
                    <ol className="nodes">
                      {unit.lessons.map((lesson, idx) => {
                        const unlocked = isUnlocked(lesson.id, progress.completed)
                        const done = completedSet.has(lesson.id)
                        const perfect = progress.perfect.includes(lesson.id)
                        return (
                          <li key={lesson.id} className={idx % 2 ? 'right' : 'left'}>
                            <button
                              className={
                                'node' + (done ? ' done' : '') + (!unlocked ? ' locked' : '')
                              }
                              style={{ borderColor: unit.accent, color: unit.accent }}
                              disabled={!unlocked}
                              onClick={() => startLesson(lesson.id)}
                              title={lesson.blurb}
                            >
                              {unlocked ? (done ? (perfect ? '★' : '✓') : unit.icon) : '🔒'}
                            </button>
                            <div className="node-meta">
                              <b>{lesson.title}</b>
                              <span>{lesson.titleKn}</span>
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  </section>
                ))}
              </main>
            )}

            {tab === 'letters' && (
              <main className="page">
                <h2>ವರ್ಣಮಾಲೆ · Alphabet</h2>
                <p>Tap any letter to hear it. This is the script Grade 2 children write.</p>
                <h3>ಸ್ವರಗಳು · Vowels</h3>
                <div className="alpha">
                  {SWARAS.map((l) => (
                    <button key={l.kn} className="alpha-cell" onClick={() => speakKannada(l.kn)}>
                      <b>{l.kn}</b>
                      <small>{l.rom}</small>
                    </button>
                  ))}
                </div>
                <h3>ವ್ಯಂಜನಗಳು · Consonants</h3>
                <div className="alpha">
                  {VYANJANAS.map((l) => (
                    <button key={l.kn} className="alpha-cell" onClick={() => speakKannada(l.kn)}>
                      <b>{l.kn}</b>
                      <small>{l.rom}</small>
                    </button>
                  ))}
                </div>
              </main>
            )}

            {tab === 'stories' && (
              <main className="page">
                <h2>ಕಥೆ · Stories</h2>
                <p>Short original retellings of Grade 2 Kali Kannada themes. Tap a line to hear it.</p>
                {STORIES.map((s) => (
                  <article key={s.id} className="story card">
                    <h3>
                      {s.emoji} {s.title}
                    </h3>
                    <p className="rom">
                      {s.rom} · {s.en}
                    </p>
                    {s.lines.map((line) => (
                      <button
                        key={line.kn}
                        className="line"
                        onClick={() => speakKannada(line.kn)}
                      >
                        <span className="kn">{line.kn}</span>
                        <span className="rom">{line.rom}</span>
                        <span className="en">{line.en}</span>
                      </button>
                    ))}
                    <p className="note">{s.moral}</p>
                  </article>
                ))}
              </main>
            )}

            {tab === 'profile' && (
              <main className="page">
                <Mascot mood="idle" outfit={progress.outfit} />
                <h2>{progress.name}</h2>
                <p>{league(progress.xp)}</p>
                <div className="stats">
                  <div>
                    <b>{progress.xp}</b>
                    <span>XP</span>
                  </div>
                  <div>
                    <b>
                      {doneCount}/{totalLessons}
                    </b>
                    <span>Lessons</span>
                  </div>
                  <div>
                    <b>{progress.streak}</b>
                    <span>Streak</span>
                  </div>
                </div>
                <label className="name-edit">
                  Child’s name
                  <input
                    value={progress.name}
                    onChange={(e) => setProgress({ ...progress, name: e.target.value })}
                  />
                </label>
                <button className="cta" onClick={startPractice}>
                  Practice weak words
                </button>
                <button className="ghost" onClick={() => setScreen({ name: 'shop' })}>
                  Shop & hearts
                </button>
                <button className="ghost" onClick={() => setScreen({ name: 'guide' })}>
                  Parent / teacher guide
                </button>
                {progress.mistakes.length > 0 && (
                  <>
                    <h3>Review</h3>
                    <ul className="review">
                      {progress.mistakes.slice(0, 8).map((m) => (
                        <li key={m.kn}>
                          <button onClick={() => speakKannada(m.kn)}>
                            {m.kn} · {m.rom} · {m.en}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </main>
            )}

            <nav className="tabs">
              <button className={tab === 'learn' ? 'on' : ''} onClick={() => setTab('learn')}>
                Learn
              </button>
              <button className={tab === 'letters' ? 'on' : ''} onClick={() => setTab('letters')}>
                Letters
              </button>
              <button className={tab === 'stories' ? 'on' : ''} onClick={() => setTab('stories')}>
                Stories
              </button>
              <button className={tab === 'profile' ? 'on' : ''} onClick={() => setTab('profile')}>
                Me
              </button>
            </nav>
          </>
        )}
    </div>
  )
}

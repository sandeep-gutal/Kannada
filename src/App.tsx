import { useEffect, useMemo, useState } from 'react'
import { ALL_LESSONS, getLesson, isUnlocked, STORIES, UNITS } from './data/curriculum'
import { SWARAS, VYANJANAS } from './data/letters'
import { PROFILE_LIST, getProfileDef } from './data/profiles'
import { LessonView } from './components/LessonView'
import { Mascot } from './components/Mascot'
import {
  applyLessonComplete,
  currentLessonTitle,
  exportBackup,
  importBackup,
  loadMemory,
  loseHeart,
  mergeMemory,
  rememberMistake,
  saveMemory,
  STORAGE_KEY,
} from './lib/progress'
import { speakKannada } from './lib/speech'
import { shuffle } from './lib/quiz'
import type { AppMemory, ProfileId, Progress, Screen } from './types'
import './app-ui.css'

function league(xp: number): string {
  if (xp >= 800) return 'Gold league'
  if (xp >= 300) return 'Silver league'
  return 'Bronze league'
}

function updateActive(memory: AppMemory, next: Progress): AppMemory {
  if (!memory.activeId) return memory
  return {
    ...memory,
    profiles: { ...memory.profiles, [memory.activeId]: next },
  }
}

export default function App() {
  const [memory, setMemory] = useState<AppMemory>(() => loadMemory())
  const [screen, setScreen] = useState<Screen>(() =>
    loadMemory().activeId ? { name: 'home' } : { name: 'picker' },
  )
  const [tab, setTab] = useState<'learn' | 'stories' | 'letters' | 'family' | 'profile'>('learn')
  const [practiceLesson, setPracticeLesson] = useState<(typeof ALL_LESSONS)[0] | null>(null)
  const [backupText, setBackupText] = useState('')
  const [backupNote, setBackupNote] = useState('')

  useEffect(() => {
    const merged = saveMemory(memory)
    if (JSON.stringify(merged) !== JSON.stringify(memory)) {
      setMemory(merged)
      return
    }
    if (typeof BroadcastChannel === 'undefined') return
    const channel = new BroadcastChannel(STORAGE_KEY)
    channel.postMessage('saved')
    channel.close()
  }, [memory])

  useEffect(() => {
    const same = (next: AppMemory) =>
      setMemory((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    const refresh = () => same(loadMemory())
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) refresh()
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', onVisible)
    let channel: BroadcastChannel | null = null
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(STORAGE_KEY)
      channel.onmessage = () => refresh()
    }
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', onVisible)
      channel?.close()
    }
  }, [])

  const progress = memory.activeId ? memory.profiles[memory.activeId] : null
  const profileDef = progress ? getProfileDef(progress.profileId) : null
  const completedSet = useMemo(() => new Set(progress?.completed ?? []), [progress?.completed])
  const totalLessons = ALL_LESSONS.length

  const selectProfile = (id: ProfileId) => {
    const disk = loadMemory()
    setMemory({ ...disk, activeId: id })
    setScreen({ name: 'home' })
    setTab('learn')
  }

  const openPicker = () => {
    setMemory(loadMemory())
    setScreen({ name: 'picker' })
  }

  const patch = (fn: (p: Progress) => Progress) => {
    setMemory((m) => {
      if (!m.activeId) return m
      return updateActive(m, fn(m.profiles[m.activeId]))
    })
  }

  const startLesson = (id: string) => {
    if (!progress) return
    setScreen({ name: 'lesson', lessonId: id })
  }

  const startPractice = () => {
    const pool = ALL_LESSONS.filter((l) => completedSet.has(l.id) || l.id === ALL_LESSONS[0]?.id)
    const src = shuffle(pool).slice(0, 3)
    const exercises = shuffle(src.flatMap((l) => l.exercises.filter((e) => e.kind !== 'teach'))).slice(
      0,
      8,
    )
    setPracticeLesson({
      id: 'practice',
      title: 'Practice',
      titleKn: 'ಅಭ್ಯಾಸ',
      blurb: 'A mix of what you have learned',
      xp: 10,
      exercises,
    })
    setScreen({ name: 'lesson', lessonId: 'practice' })
  }

  const activeLesson =
    screen.name === 'lesson'
      ? screen.lessonId === 'practice'
        ? practiceLesson
        : getLesson(screen.lessonId)
      : undefined

  if (screen.name === 'picker' || !progress || !profileDef) {
    return (
      <div className="shell picker-shell">
        <header className="top">
          <div>
            <p className="kicker">NPS Varthur · CBSE Grade 2</p>
            <h1 className="brand">
              ಕಲಿ <span>Kali</span>
            </h1>
          </div>
        </header>
        <main className="page">
          <h2>Who is learning?</h2>
          <p>
            Each person has a separate path saved in this browser. Hearts and gems never run out.
            Private windows start empty — use Family → Copy family save to bring progress across.
          </p>
          <div className="profile-grid">
            {PROFILE_LIST.map((p) => {
              const stats = memory.profiles[p.id]
              const done = stats.completed.length
              return (
                <button
                  key={p.id}
                  className="profile-card"
                  style={{ borderColor: p.color }}
                  onClick={() => selectProfile(p.id)}
                >
                  <span className="profile-emoji">{p.emoji}</span>
                  <b>{p.name}</b>
                  <small>{p.blurb}</small>
                  <span className="profile-stat">
                    {done}/{totalLessons} lessons · {stats.xp} XP
                  </span>
                </button>
              )
            })}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="shell">
      {screen.name === 'lesson' && activeLesson && (
        <LessonView
          lesson={activeLesson}
          hearts={progress.hearts}
          unlimited={progress.unlimited}
          onExit={() => setScreen({ name: 'home' })}
          onCorrect={() => undefined}
          onWrong={(word) => {
            patch((p) => rememberMistake(loseHeart(p), word))
          }}
          onOutOfHearts={() => setScreen({ name: 'shop' })}
          onComplete={(mistakes) => {
            const xp = Math.max(5, activeLesson.xp - mistakes)
            const perfect = mistakes === 0
            patch((p) => {
              if (activeLesson.id === 'practice') {
                const t = new Date().toISOString().slice(0, 10)
                return {
                  ...p,
                  xp: p.xp + xp,
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
          <p className="rom">
            {progress.name} · ಚೆನ್ನಾಗಿದೆ · well done
          </p>
          <div className="stats">
            <div>
              <b>+{screen.xp}</b>
              <span>XP</span>
            </div>
            <div>
              <b>∞</b>
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
          <h1>Shop</h1>
          <p>This family has unlimited hearts and gems. Outfits are free.</p>
          <p className="hearts big">❤ ∞</p>
          <p>💎 ∞ gems</p>
          <h2>Mascot outfits</h2>
          <div className="options">
            {[
              { id: 'chikki', name: 'Chikki green' },
              { id: 'gold', name: 'Mysore gold' },
              { id: 'mysore', name: 'Dasara red' },
            ].map((o) => (
              <button
                key={o.id}
                className={'choice' + (progress.outfit === o.id ? ' on' : '')}
                onClick={() => patch((p) => ({ ...p, outfit: o.id }))}
              >
                {o.name}
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
            Four family profiles live in this browser: <strong>Riddhi</strong> and{' '}
            <strong>Siddhi</strong> follow the Grade 2 path in order.{' '}
            <strong>Sandeep</strong> and <strong>Pragati</strong> can jump into any lesson. Progress
            for each person is saved on this device.
          </p>
          <p>
            <strong>Kali</strong> is Grade 2 Kannada for non-native speakers at NPS Varthur (CBSE),
            using Kali Kannada (Parichaya Bhashe).
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
                <button className="who" onClick={openPicker}>
                  {profileDef.emoji} {progress.name}
                </button>
                <span>🔥 {progress.streak}</span>
                <span>💎 ∞</span>
                <span>❤ ∞</span>
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
                {progress.canJump && (
                  <p className="jump-note">You can jump to any step on this profile.</p>
                )}
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
                        const unlocked = isUnlocked(
                          lesson.id,
                          progress.completed,
                          progress.canJump,
                        )
                        const sequential = isUnlocked(lesson.id, progress.completed, false)
                        const done = completedSet.has(lesson.id)
                        const perfect = progress.perfect.includes(lesson.id)
                        return (
                          <li key={lesson.id} className={idx % 2 ? 'right' : 'left'}>
                            <button
                              className={
                                'node' +
                                (done ? ' done' : '') +
                                (!unlocked ? ' locked' : '') +
                                (unlocked && !sequential && !done ? ' jump' : '')
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
                              <span>
                                {lesson.titleKn}
                                {unlocked && !sequential && !done ? ' · jump' : ''}
                              </span>
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
                      <button key={line.kn} className="line" onClick={() => speakKannada(line.kn)}>
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

            {tab === 'family' && (
              <main className="page">
                <h2>Family dashboard</h2>
                <p className="note">
                  Progress is saved in <strong>this browser’s memory</strong>, not on a server. The
                  same website on the same phone or laptop shares one family save. A private /
                  incognito window is a blank copy — it cannot see the other window unless you paste
                  the family save below.
                </p>
                <div className="backup-box">
                  <button
                    className="cta"
                    onClick={async () => {
                      const code = exportBackup(loadMemory())
                      setBackupText(code)
                      try {
                        await navigator.clipboard.writeText(code)
                        setBackupNote('Family save copied. Paste it in a private window or another browser.')
                      } catch {
                        setBackupNote('Copy the text below, then paste it in the other window.')
                      }
                    }}
                  >
                    Copy family save
                  </button>
                  <textarea
                    className="backup-text"
                    rows={3}
                    placeholder="Paste a family save here"
                    value={backupText}
                    onChange={(e) => setBackupText(e.target.value)}
                  />
                  <button
                    className="ghost"
                    onClick={() => {
                      const incoming = importBackup(backupText)
                      if (!incoming) {
                        setBackupNote('That save could not be read.')
                        return
                      }
                      const merged = saveMemory(mergeMemory(loadMemory(), incoming))
                      setMemory({ ...merged, activeId: memory.activeId })
                      setBackupNote('Progress restored on this browser. Open the profile to see completed lessons.')
                    }}
                  >
                    Restore family save
                  </button>
                  {backupNote && <p className="rom">{backupNote}</p>}
                </div>
                {PROFILE_LIST.map((p) => {
                  const stats = memory.profiles[p.id]
                  const pct = Math.round((stats.completed.length / totalLessons) * 100)
                  const current = currentLessonTitle(stats.completed, ALL_LESSONS)
                  const active = memory.activeId === p.id
                  return (
                    <article
                      key={p.id}
                      className={'dash-card' + (active ? ' active' : '')}
                      style={{ borderColor: p.color }}
                    >
                      <div className="dash-top">
                        <span className="profile-emoji">{p.emoji}</span>
                        <div>
                          <h3>{p.name}</h3>
                          <small>{p.canJump ? 'Can jump any step' : 'Follows the path'}</small>
                        </div>
                        {active && <span className="pill">Playing</span>}
                      </div>
                      <div className="xp-track">
                        <div className="xp-fill" style={{ width: `${pct}%`, background: p.color }} />
                      </div>
                      <div className="dash-stats">
                        <span>
                          <b>{stats.completed.length}</b>/{totalLessons} lessons
                        </span>
                        <span>
                          <b>{stats.xp}</b> XP
                        </span>
                        <span>
                          <b>{stats.perfect.length}</b> perfect
                        </span>
                        <span>
                          <b>{stats.streak}</b> streak
                        </span>
                      </div>
                      <p className="dash-next">
                        {stats.completed.length >= totalLessons ? 'Path complete' : `Next: ${current}`}
                      </p>
                      <p className="rom">
                        Last play: {stats.lastActive || 'not yet'} · ❤ ∞ · 💎 ∞
                      </p>
                      <button className="ghost" onClick={() => selectProfile(p.id)}>
                        {active ? 'Continue as ' + p.name : 'Switch to ' + p.name}
                      </button>
                    </article>
                  )
                })}
              </main>
            )}

            {tab === 'profile' && (
              <main className="page">
                <Mascot mood="idle" outfit={progress.outfit} />
                <h2>
                  {profileDef.emoji} {progress.name}
                </h2>
                <p>
                  {league(progress.xp)}
                  {progress.canJump ? ' · jump unlocked' : ''}
                </p>
                <div className="stats">
                  <div>
                    <b>{progress.xp}</b>
                    <span>XP</span>
                  </div>
                  <div>
                    <b>
                      {progress.completed.length}/{totalLessons}
                    </b>
                    <span>Lessons</span>
                  </div>
                  <div>
                    <b>{progress.streak}</b>
                    <span>Streak</span>
                  </div>
                </div>
                <button className="cta" onClick={startPractice}>
                  Practice weak words
                </button>
                <button className="ghost" onClick={openPicker}>
                  Switch profile
                </button>
                <button className="ghost" onClick={() => setScreen({ name: 'shop' })}>
                  Shop
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

            <nav className="tabs five">
              <button className={tab === 'learn' ? 'on' : ''} onClick={() => setTab('learn')}>
                Learn
              </button>
              <button className={tab === 'letters' ? 'on' : ''} onClick={() => setTab('letters')}>
                Letters
              </button>
              <button className={tab === 'stories' ? 'on' : ''} onClick={() => setTab('stories')}>
                Stories
              </button>
              <button className={tab === 'family' ? 'on' : ''} onClick={() => setTab('family')}>
                Family
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

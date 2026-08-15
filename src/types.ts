export type Word = {
  kn: string
  rom: string
  en: string
  emoji: string
  parts?: string[]
}

export type ChoiceExercise = {
  id: string
  kind: 'choice'
  instruction: string
  prompt: string
  promptLang: 'en' | 'kn' | 'rom'
  speak?: string
  options: Word[]
  correctKn: string
}

export type MatchExercise = {
  id: string
  kind: 'match'
  instruction: string
  pairs: Word[]
}

export type TilesExercise = {
  id: string
  kind: 'tiles'
  instruction: string
  word: Word
  extraParts: string[]
}

export type TeachExercise = {
  id: string
  kind: 'teach'
  instruction: string
  word: Word
  note?: string
}

export type TrueFalseExercise = {
  id: string
  kind: 'truefalse'
  instruction: string
  statement: string
  speak?: string
  correct: boolean
  explain: string
}

export type Exercise =
  | TeachExercise
  | ChoiceExercise
  | MatchExercise
  | TilesExercise
  | TrueFalseExercise

export type Lesson = {
  id: string
  title: string
  titleKn: string
  blurb: string
  xp: number
  exercises: Exercise[]
}

export type Unit = {
  id: string
  number: number
  title: string
  titleKn: string
  description: string
  color: string
  accent: string
  icon: string
  lessons: Lesson[]
}

export type Screen =
  | { name: 'login' }
  | { name: 'picker' }
  | { name: 'home' }
  | { name: 'lesson'; lessonId: string }
  | { name: 'result'; lessonId: string; xp: number; perfect: boolean; mistakes: number }
  | { name: 'alphabet' }
  | { name: 'stories' }
  | { name: 'practice' }
  | { name: 'profile' }
  | { name: 'shop' }
  | { name: 'guide' }

export type ProfileId = 'riddhi' | 'siddhi' | 'sandeep' | 'pragati'

export type ProfileDef = {
  id: ProfileId
  name: string
  emoji: string
  color: string
  blurb: string
  canJump: boolean
  outfit: string
  pin: string
}

export type Progress = {
  profileId: ProfileId
  xp: number
  gems: number
  hearts: number
  heartsAt: number
  streak: number
  lastActive: string
  completed: string[]
  perfect: string[]
  mistakes: { kn: string; en: string; rom: string }[]
  outfit: string
  name: string
  dailyXp: number
  dailyDate: string
  goal: number
  unlimited: boolean
  canJump: boolean
}

export type AppMemory = {
  activeId: ProfileId | null
  profiles: Record<ProfileId, Progress>
}

import { KAGUNITA_KA, KALI_GROUPS, letterByKn, SWARAS } from './letters'
import {
  ANIMALS,
  BODY,
  COLOURS,
  FAMILY,
  FLAG,
  FOOD,
  GREETINGS,
  HOME,
  NATURE,
  NUMBERS,
  PEOPLE,
  PHRASES,
  SCHOOL,
  STORY_WORDS,
  SWARA_WORDS,
} from './vocab'
import { pickDistractors, shuffle } from '../lib/quiz'
import type { Exercise, Lesson, Unit, Word } from '../types'

let exCount = 0
function eid(prefix: string): string {
  exCount += 1
  return `${prefix}-${exCount}`
}

function teach(word: Word, note?: string): Exercise {
  return {
    id: eid('t'),
    kind: 'teach',
    instruction: 'New word — listen, then continue',
    word,
    note,
  }
}

function choice(
  item: Word,
  pool: Word[],
  mode: 'en-to-kn' | 'kn-to-en' | 'listen',
): Exercise {
  const options = shuffle([item, ...pickDistractors(pool, item.kn, 3)])
  if (mode === 'en-to-kn') {
    return {
      id: eid('c'),
      kind: 'choice',
      instruction: 'Tap the Kannada word',
      prompt: item.en,
      promptLang: 'en',
      speak: item.kn,
      options,
      correctKn: item.kn,
    }
  }
  if (mode === 'listen') {
    return {
      id: eid('c'),
      kind: 'choice',
      instruction: 'What did you hear?',
      prompt: '🔊 Listen',
      promptLang: 'en',
      speak: item.kn,
      options,
      correctKn: item.kn,
    }
  }
  return {
    id: eid('c'),
    kind: 'choice',
    instruction: 'What does this mean?',
    prompt: item.kn,
    promptLang: 'kn',
    speak: item.kn,
    options,
    correctKn: item.kn,
  }
}

function match(items: Word[]): Exercise {
  return {
    id: eid('m'),
    kind: 'match',
    instruction: 'Match Kannada with English',
    pairs: items.slice(0, 4),
  }
}

function tiles(word: Word, extras: string[]): Exercise {
  return {
    id: eid('x'),
    kind: 'tiles',
    instruction: `Build “${word.en}”`,
    word,
    extraParts: extras,
  }
}

function tf(statement: string, correct: boolean, explain: string, speak?: string): Exercise {
  return {
    id: eid('f'),
    kind: 'truefalse',
    instruction: 'True or false?',
    statement,
    speak,
    correct,
    explain,
  }
}

function lessonFromWords(
  id: string,
  title: string,
  titleKn: string,
  blurb: string,
  words: Word[],
  extraNote?: string,
): Lesson {
  const exercises: Exercise[] = []
  const pool = words
  for (const w of words) {
    exercises.push(teach(w, extraNote))
    exercises.push(choice(w, pool, 'en-to-kn'))
    exercises.push(choice(w, pool, 'listen'))
  }
  if (words.length >= 4) {
    exercises.push(match(shuffle(words)))
  }
  for (const w of words) {
    if (w.parts && w.parts.length > 1) {
      const extras = shuffle(words.flatMap((x) => x.parts ?? []))
        .filter((p) => !(w.parts ?? []).includes(p))
        .slice(0, 3)
      exercises.push(tiles(w, extras))
    }
    exercises.push(choice(w, pool, 'kn-to-en'))
  }
  return { id, title, titleKn, blurb, xp: 15, exercises }
}

function reviewLesson(id: string, title: string, titleKn: string, words: Word[]): Lesson {
  const pool = words
  const exercises: Exercise[] = shuffle(words).flatMap((w) => [
    choice(w, pool, 'listen'),
    choice(w, pool, 'en-to-kn'),
  ])
  if (words.length >= 4) exercises.push(match(words))
  exercises.push(
    tf(
      `${words[0]?.kn} means “${words[0]?.en}”.`,
      true,
      `Yes — ${words[0]?.kn} (${words[0]?.rom}) = ${words[0]?.en}.`,
      words[0]?.kn,
    ),
  )
  return {
    id,
    title,
    titleKn,
    blurb: 'Quick mix to lock it in',
    xp: 20,
    exercises: exercises.slice(0, 12),
  }
}

function letterLesson(
  id: string,
  title: string,
  letters: Word[],
  exampleWords: Word[],
): Lesson {
  const pool = [...letters, ...exampleWords]
  const exercises: Exercise[] = []
  for (const l of letters) {
    exercises.push(
      teach(l, 'Say it out loud. Kannada letters almost always include a short “a” sound unless a vowel sign changes them.'),
    )
    exercises.push(choice(l, letters, 'listen'))
    exercises.push(choice(l, letters, 'en-to-kn'))
  }
  const examples = exampleWords.slice(0, Math.min(3, exampleWords.length))
  for (const w of examples) {
    exercises.push(teach(w, `Listen for the starting sound.`))
    exercises.push(choice(w, pool, 'en-to-kn'))
  }
  if (letters.length >= 3) exercises.push(match(letters.slice(0, 4)))
  return { id, title, titleKn: title, blurb: 'Letters + first words', xp: 15, exercises }
}

function unit(
  number: number,
  id: string,
  title: string,
  titleKn: string,
  description: string,
  color: string,
  accent: string,
  icon: string,
  lessons: Lesson[],
): Unit {
  return { id, number, title, titleKn, description, color, accent, icon, lessons }
}

function buildUnits(): Unit[] {
  const greetLearn = lessonFromWords(
    'u1-l1',
    'Say hello',
    'ನಮಸ್ಕಾರ',
    'Classroom greetings used every day at NPS',
    GREETINGS.slice(0, 4),
    'Kannada speakers greet with ನಮಸ್ಕಾರ — palms together, a small smile.',
  )
  const greetMore = lessonFromWords(
    'u1-l2',
    'Please and thank you',
    'ದಯವಿಟ್ಟು',
    'Polite words for non-native speakers',
    GREETINGS.slice(4),
  )
  const greetReview = reviewLesson('u1-l3', 'Greetings checkpoint', 'ಪರಿಶೀಲನೆ', GREETINGS)

  const me = lessonFromWords(
    'u2-l1',
    'I and you',
    'ನಾನು, ನೀನು',
    'Talk about yourself respectfully',
    PEOPLE,
    'Use ನೀವು for teachers and elders. ನೀನು is for close friends.',
  )

  const swara1 = letterLesson('u3-l1', 'Vowels ಅ ಆ ಇ ಈ ಉ ಊ', SWARAS.slice(0, 6), SWARA_WORDS.slice(0, 6))
  const swara2 = letterLesson('u3-l2', 'Vowels ಋ ಎ ಏ ಐ ಒ ಓ ಔ', SWARAS.slice(6, 13), SWARA_WORDS.slice(6))
  const swara3 = letterLesson(
    'u3-l3',
    'Anusvara and visarga',
    SWARAS.slice(13),
    [
      { kn: 'ಅಂ', rom: 'am', en: 'the bindu sound', emoji: '🔔' },
      { kn: 'ಕಂ', rom: 'kam', en: 'ka + anusvara', emoji: '🪷' },
    ],
  )
  const swaraReview = reviewLesson('u3-l4', 'All vowels', 'ಸ್ವರಗಳು', [
    ...SWARAS.slice(0, 8),
    ...SWARA_WORDS.slice(0, 4),
  ])

  const kaliLessons: Lesson[] = KALI_GROUPS.map((g, i) => {
    const letters = g.letters.map(letterByKn)
    const examples = SWARA_WORDS.concat(GREETINGS, FAMILY, ANIMALS).filter((w) =>
      g.letters.some((ch) => w.kn.startsWith(ch)),
    )
    return letterLesson(`u4-l${i + 1}`, `Akshara ${g.title}: ${g.letters.join(' ')}`, letters, examples.slice(0, 4))
  })

  const family1 = lessonFromWords('u5-l1', 'Amma and Appa', 'ಅಮ್ಮ ಅಪ್ಪ', 'Home words first', FAMILY.slice(0, 5))
  const family2 = lessonFromWords('u5-l2', 'The whole family', 'ಕುಟುಂಬ', 'Siblings and grandparents', FAMILY.slice(5))
  const familyR = reviewLesson('u5-l3', 'Family checkpoint', 'ಕುಟುಂಬ', FAMILY)

  const school1 = lessonFromWords(
    'u6-l1',
    'At school',
    'ಶಾಲೆಯಲ್ಲಿ',
    'NPS classroom words',
    SCHOOL.slice(0, 5),
    'Grade 2 Kannada at NPS Varthur uses Kali Kannada (Parichaya Bhashe) — Kannada as a new language.',
  )
  const school2 = lessonFromWords('u6-l2', 'Lessons and play', 'ಪಾಠ ಮತ್ತು ಆಟ', 'Class, lesson, game', SCHOOL.slice(5))
  const schoolR = reviewLesson('u6-l3', 'School checkpoint', 'ಶಾಲೆ', SCHOOL)

  const num1 = lessonFromWords('u7-l1', 'Count 1 to 5', '೧ – ೫', 'Kannada numbers', NUMBERS.slice(0, 5))
  const num2 = lessonFromWords('u7-l2', 'Count 6 to 10', '೬ – ೧೦', 'Keep counting', NUMBERS.slice(5, 10))
  const num3 = lessonFromWords('u7-l3', 'Eleven and twenty', 'ಹನ್ನೊಂದು', 'A little further', NUMBERS.slice(10))
  const numR = reviewLesson('u7-l4', 'Numbers checkpoint', 'ಸಂಖ್ಯೆ', NUMBERS)

  const col = lessonFromWords(
    'u8-l1',
    'Colours',
    'ಬಣ್ಣಗಳು',
    'Needed for “Namma Baavuta” (our flag)',
    COLOURS,
  )
  const colR = reviewLesson('u8-l2', 'Colour mix', 'ಬಣ್ಣ', COLOURS)

  const ani1 = lessonFromWords('u9-l1', 'Pets and farm', 'ಪ್ರಾಣಿಗಳು', 'Everyday animals', ANIMALS.slice(0, 5))
  const ani2 = lessonFromWords('u9-l2', 'Wild and proud', 'ಕಾಡು', 'Tiger, lion, peacock', ANIMALS.slice(5))
  const aniR = reviewLesson('u9-l3', 'Animals checkpoint', 'ಪ್ರಾಣಿ', ANIMALS)

  const nat1 = lessonFromWords(
    'u10-l1',
    'Sun, rain, rainbow',
    'ಮಳೆ ಮತ್ತು ಕಾಮನಬಿಲ್ಲು',
    'Aligned to Grade 2 poems on rain and rainbow',
    NATURE,
  )
  const food1 = lessonFromWords('u11-l1', 'Time to eat', 'ಊಟ', 'South Indian meal words', FOOD.slice(0, 5))
  const food2 = lessonFromWords('u11-l2', 'Fruit and salt', 'ಹಣ್ಣು', 'Tastes of home', FOOD.slice(5))
  const body1 = lessonFromWords('u12-l1', 'My body', 'ನನ್ನ ದೇಹ', 'Point and say', BODY)
  const home1 = lessonFromWords('u13-l1', 'Around the house', 'ಮನೆಯಲ್ಲಿ', 'Doors, windows, light', HOME)

  const flag1 = lessonFromWords(
    'u14-l1',
    'Our flag',
    'ನಮ್ಮ ಬಾವುಟ',
    'Kali Kannada-2 poem theme: ನಮ್ಮ ಬಾವುಟ — saffron, white, green, and the chakra',
    FLAG.concat(COLOURS.slice(0, 4)).slice(0, 8),
    'Saffron = courage, white = peace, green = prosperity. The wheel is the Ashoka Chakra.',
  )
  const flagR = reviewLesson('u14-l2', 'Flag checkpoint', 'ಧ್ವಜ', FLAG)

  const kagu1 = letterLesson('u15-l1', 'Kagunita of ಕ', KAGUNITA_KA.slice(0, 6), [
    { kn: 'ಕೈ', rom: 'kai', en: 'hand', emoji: '✋' },
    { kn: 'ಕಮಲ', rom: 'kamala', en: 'lotus', emoji: '🪷' },
  ])
  const kagu2 = letterLesson('u15-l2', 'More ಕ forms', KAGUNITA_KA.slice(6), [
    { kn: 'ಕೇಸರಿ', rom: 'kesari', en: 'saffron', emoji: '🟠' },
    { kn: 'ಕೋತಿ', rom: 'koti', en: 'monkey', emoji: '🐵' },
  ])

  const phrase1 = lessonFromWords(
    'u16-l1',
    'Real sentences',
    'ವಾಕ್ಯಗಳು',
    'Phrases a Grade 2 child can use with a teacher',
    PHRASES.slice(0, 4),
  )
  const phrase2 = lessonFromWords(
    'u16-l2',
    'Help me understand',
    'ಸಹಾಯ',
    'Survival Kannada for non-native speakers',
    PHRASES.slice(4),
  )

  const storyIntro: Lesson = {
    id: 'u17-l1',
    title: 'Kindness words',
    titleKn: 'ಕರುಣೆ',
    blurb: 'Values from Grade 2 stories — greed, kindness, sharing',
    xp: 15,
    exercises: STORY_WORDS.flatMap((w) => [teach(w), choice(w, STORY_WORDS, 'en-to-kn')]).concat([
      match(STORY_WORDS.slice(0, 4)),
      tf('ದುರಾಸೆ is a good thing.', false, 'ದುರಾಸೆ means greed. Grade 2 stories teach us not to be greedy.'),
      tf('ಹಂಚಿಕೆ means sharing.', true, 'Sharing (ಹಂಚಿಕೆ) is a value in Kali Kannada stories.'),
    ]),
  }

  const storyQuiz: Lesson = {
    id: 'u17-l2',
    title: 'Story sense',
    titleKn: 'ಕಥೆ',
    blurb: 'Simple morals, original lines for young learners',
    xp: 20,
    exercises: [
      teach(
        { kn: 'ಹಂಚಿದರೆ ಸಂತೋಷ', rom: 'hanchidare santosha', en: 'sharing brings joy', emoji: '😊' },
        'A hen hid her chicks when danger came. Grown-ups keep us safe — we listen.',
      ),
      choice(
        { kn: 'ಕರುಣೆ', rom: 'karune', en: 'kindness', emoji: '💗' },
        STORY_WORDS,
        'en-to-kn',
      ),
      tf(
        'The fruit of greed (ದುರಾಸೆಯ ಫಲ) is happiness.',
        false,
        'Grade 2 story theme: greed leads to loss. Kindness and sharing win.',
      ),
      tf(
        'ನಮ್ಮ ಬಾವುಟ means “our flag”.',
        true,
        'Namma baavuta is a Kali Kannada-2 poem. Children learn to respect the national flag.',
        'ನಮ್ಮ ಬಾವುಟ',
      ),
      teach(
        { kn: 'ಮಳೆ ಬಂತು', rom: 'male bantu', en: 'the rain came', emoji: '🌧️' },
        'A Grade 2 rain poem theme: the earth drinks, flowers smile, children play.',
      ),
      choice(NATURE[0]!, NATURE, 'listen'),
      match([STORY_WORDS[0]!, STORY_WORDS[1]!, STORY_WORDS[2]!, FLAG[1]!]),
    ],
  }

  return [
    unit(
      1,
      'greet',
      'Namaskara',
      'ನಮಸ್ಕಾರ',
      'Start speaking from day one — greetings with sound, script, and English.',
      '#58CC02',
      '#46A302',
      '🙏',
      [greetLearn, greetMore, greetReview],
    ),
    unit(
      2,
      'me',
      'This is me',
      'ನಾನು',
      'I, you, name, friend — with respectful “neevu” for teachers.',
      '#1CB0F6',
      '#0E8FCB',
      '🧒',
      [me],
    ),
    unit(
      3,
      'swara',
      'Swaras (vowels)',
      'ಸ್ವರಗಳು',
      'All Kannada vowels, the way Kali Kannada introduces akshara for non-native children.',
      '#CE82FF',
      '#A568CC',
      '🔤',
      [swara1, swara2, swara3, swaraReview],
    ),
    unit(
      4,
      'kali-akshara',
      'Kali Kannada letters',
      'ಅಕ್ಷರ ಪಾಠ',
      'Letter groups from Kali Kannada-2 Part 2 — read, hear, and match.',
      '#FF9600',
      '#E08600',
      '✏️',
      kaliLessons,
    ),
    unit(
      5,
      'family',
      'My family',
      'ನನ್ನ ಕುಟುಂಬ',
      'Amma, Appa, Ajji — the first nouns every Grade 2 child writes.',
      '#FF4B4B',
      '#EA2B2B',
      '🏠',
      [family1, family2, familyR],
    ),
    unit(
      6,
      'school',
      'NPS classroom',
      'ಶಾಲೆ',
      'School, teacher, book, lesson — words used in Varthur classrooms.',
      '#2B70C9',
      '#1F5AAB',
      '🏫',
      [school1, school2, schoolR],
    ),
    unit(
      7,
      'numbers',
      'Numbers',
      'ಸಂಖ್ಯೆಗಳು',
      'Count in Kannada from 1 to 20.',
      '#FFC800',
      '#E5B400',
      '🔢',
      [num1, num2, num3, numR],
    ),
    unit(
      8,
      'colour',
      'Colours',
      'ಬಣ್ಣಗಳು',
      'Colours of clothes, crayons, and the national flag.',
      '#FF82BF',
      '#E265A3',
      '🌈',
      [col, colR],
    ),
    unit(
      9,
      'animals',
      'Animals',
      'ಪ್ರಾಣಿಗಳು',
      'Pets, farm, and Karnataka’s peacock.',
      '#A560E8',
      '#8A48CC',
      '🐘',
      [ani1, ani2, aniR],
    ),
    unit(
      10,
      'nature',
      'Rain and rainbow',
      'ಮಳೆ',
      'Nature words tied to Grade 2 poems on rain and the rainbow.',
      '#00CD9C',
      '#00A87E',
      '🌧️',
      [nat1],
    ),
    unit(11, 'food', 'Food', 'ಊಟ', 'Rice, milk, mango, idli — lunchbox Kannada.', '#FF9600', '#E08600', '🥭', [
      food1,
      food2,
    ]),
    unit(12, 'body', 'Body', 'ದೇಹ', 'Head, eyes, hands — point and speak.', '#FF4B4B', '#EA2B2B', '✋', [body1]),
    unit(13, 'home', 'Home', 'ಮನೆ', 'Door, window, lamp.', '#1CB0F6', '#0E8FCB', '🚪', [home1]),
    unit(
      14,
      'flag',
      'Namma Baavuta',
      'ನಮ್ಮ ಬಾವುಟ',
      'Our flag, Karnataka, and Bengaluru — civic poem theme from Kali Kannada-2.',
      '#FFC800',
      '#E5B400',
      '🇮🇳',
      [flag1, flagR],
    ),
    unit(
      15,
      'kagunita',
      'Kagunita',
      'ಕಾಗುಣಿತ',
      'How ಕ changes when vowels join — the Grade 2 writing leap.',
      '#CE82FF',
      '#A568CC',
      '🪷',
      [kagu1, kagu2],
    ),
    unit(
      16,
      'sentences',
      'I can speak',
      'ನಾನು ಮಾತನಾಡುತ್ತೇನೆ',
      'Full sentences for a non-native child in a Kannada class.',
      '#58CC02',
      '#46A302',
      '💬',
      [phrase1, phrase2],
    ),
    unit(
      17,
      'stories',
      'Stories & values',
      'ಕಥೆ',
      'Kindness, sharing, greed — morals from Grade 2 prose, retold in simple Kannada.',
      '#FF82BF',
      '#E265A3',
      '📖',
      [storyIntro, storyQuiz],
    ),
  ]
}

export const UNITS: Unit[] = buildUnits()

export const ALL_LESSONS: Lesson[] = UNITS.flatMap((u) => u.lessons)

export function getLesson(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id)
}

export function lessonIndex(id: string): number {
  return ALL_LESSONS.findIndex((l) => l.id === id)
}

export function isUnlocked(id: string, completed: string[]): boolean {
  const i = lessonIndex(id)
  if (i <= 0) return true
  const prev = ALL_LESSONS[i - 1]
  return prev ? completed.includes(prev.id) : true
}

export const STORIES = [
  {
    id: 'baavuta',
    title: 'ನಮ್ಮ ಬಾವುಟ',
    rom: 'Namma Baavuta',
    en: 'Our Flag',
    emoji: '🇮🇳',
    lines: [
      { kn: 'ನೋಡು ನಮ್ಮ ಬಾವುಟ.', rom: 'nodu namma baavuta', en: 'Look at our flag.' },
      { kn: 'ಕೇಸರಿ, ಬಿಳಿ, ಹಸಿರು.', rom: 'kesari, bili, hasiru', en: 'Saffron, white, green.' },
      { kn: 'ನಡುವೆ ನೀಲಿ ಚಕ್ರ.', rom: 'naduve neeli chakra', en: 'In the middle, a blue wheel.' },
      { kn: 'ನಾವು ಧ್ವಜಕ್ಕೆ ನಮಿಸುತ್ತೇವೆ.', rom: 'naavu dhvajakke namisutteve', en: 'We salute the flag.' },
    ],
    moral: 'Kali Kannada-2 poem theme: love and respect for the national flag.',
  },
  {
    id: 'male',
    title: 'ಮಳೆ ಬಂತು',
    rom: 'Male bantu',
    en: 'The rain came',
    emoji: '🌧️',
    lines: [
      { kn: 'ಮೋಡ ಬಂತು.', rom: 'moda bantu', en: 'A cloud came.' },
      { kn: 'ಮಳೆ ಸುರಿಯಿತು.', rom: 'male suriyitu', en: 'Rain poured.' },
      { kn: 'ಮರ ನಗಿತು.', rom: 'mara nagitu', en: 'The tree smiled.' },
      { kn: 'ಮಕ್ಕಳು ಆಡಿದರು.', rom: 'makkalu aadidaru', en: 'The children played.' },
    ],
    moral: 'Grade 2 rain-poem theme: nature wakes up when the monsoon arrives.',
  },
  {
    id: 'hanchike',
    title: 'ಹಂಚಿಕೆ',
    rom: 'Hanchike',
    en: 'Sharing',
    emoji: '🥭',
    lines: [
      { kn: 'ಮಾವಿನ ಹಣ್ಣು ಎರಡು.', rom: 'mavina hannu eradu', en: 'There were two mangoes.' },
      { kn: 'ಸ್ನೇಹಿತನಿಗೆ ಒಂದು ಕೊಟ್ಟೆ.', rom: 'snehitanige ondu kotte', en: 'I gave one to my friend.' },
      { kn: 'ನಾವಿಬ್ಬರೂ ಸಂತೋಷ.', rom: 'navibbaru santosha', en: 'We were both happy.' },
    ],
    moral: 'Sharing (ಹಂಚಿಕೆ) beats greed (ದುರಾಸೆ) — a Grade 2 story value.',
  },
  {
    id: 'nandanaama',
    title: 'ನಂದನಾಮ',
    rom: 'Nandanaama',
    en: 'A morning prayer',
    emoji: '🙏',
    lines: [
      { kn: 'ನಂದನಾಮ ಬಾರಯ್ಯ.', rom: 'nandanaama baarayya', en: 'Come, dear Lord (opening of the prayer-poem).' },
      { kn: 'ನಮ್ಮ ಮನೆಗೆ ಬಾರಯ್ಯ.', rom: 'namma manege baarayya', en: 'Come to our home.' },
      { kn: 'ಒಳ್ಳೆಯ ಮಾತು ಕಲಿಸು.', rom: 'olleya maatu kalisu', en: 'Teach us kind words.' },
      { kn: 'ಒಳ್ಳೆಯ ಕೆಲಸ ಕಲಿಸು.', rom: 'olleya kelasa kalisu', en: 'Teach us good work.' },
    ],
    moral: 'Opening Kali Kannada-2 poem: start the day with a gentle invocation — original learner lines, not the textbook verse.',
  },
]

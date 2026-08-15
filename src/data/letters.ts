import type { Word } from '../types'

export const SWARAS: Word[] = [
  { kn: 'ಅ', rom: 'a', en: 'short a (as in up)', emoji: '🍎', parts: ['ಅ'] },
  { kn: 'ಆ', rom: 'aa', en: 'long aa (as in father)', emoji: '🐘', parts: ['ಆ'] },
  { kn: 'ಇ', rom: 'i', en: 'short i (as in in)', emoji: '🐭', parts: ['ಇ'] },
  { kn: 'ಈ', rom: 'ee', en: 'long ee (as in see)', emoji: '🍬', parts: ['ಈ'] },
  { kn: 'ಉ', rom: 'u', en: 'short u (as in put)', emoji: '🧂', parts: ['ಉ'] },
  { kn: 'ಊ', rom: 'oo', en: 'long oo (as in food)', emoji: '🍽️', parts: ['ಊ'] },
  { kn: 'ಋ', rom: 'ru', en: 'ru (as in Krishna)', emoji: '✨', parts: ['ಋ'] },
  { kn: 'ಎ', rom: 'e', en: 'short e (as in red)', emoji: '🍃', parts: ['ಎ'] },
  { kn: 'ಏ', rom: 'ee', en: 'long e (as in they)', emoji: '❓', parts: ['ಏ'] },
  { kn: 'ಐ', rom: 'ai', en: 'ai (as in aisle)', emoji: '5️⃣', parts: ['ಐ'] },
  { kn: 'ಒ', rom: 'o', en: 'short o (as in go)', emoji: '1️⃣', parts: ['ಒ'] },
  { kn: 'ಓ', rom: 'oo', en: 'long o (as in more)', emoji: '📖', parts: ['ಓ'] },
  { kn: 'ಔ', rom: 'au', en: 'au (as in house)', emoji: '💊', parts: ['ಔ'] },
  { kn: 'ಅಂ', rom: 'am', en: 'anusvara — nasal m/n', emoji: '🔔', parts: ['ಅಂ'] },
  { kn: 'ಅಃ', rom: 'aha', en: 'visarga — soft ha', emoji: '💨', parts: ['ಅಃ'] },
]

export const VYANJANAS: Word[] = [
  { kn: 'ಕ', rom: 'ka', en: 'ka', emoji: '🪷' },
  { kn: 'ಖ', rom: 'kha', en: 'kha (breathy ka)', emoji: '⚔️' },
  { kn: 'ಗ', rom: 'ga', en: 'ga', emoji: '🏠' },
  { kn: 'ಘ', rom: 'gha', en: 'gha (breathy ga)', emoji: '🔔' },
  { kn: 'ಙ', rom: 'nga', en: 'nga (as in sing)', emoji: '🔔' },
  { kn: 'ಚ', rom: 'cha', en: 'cha', emoji: '🥄' },
  { kn: 'ಛ', rom: 'chha', en: 'chha (breathy cha)', emoji: '☂️' },
  { kn: 'ಜ', rom: 'ja', en: 'ja', emoji: '🌊' },
  { kn: 'ಝ', rom: 'jha', en: 'jha', emoji: '💧' },
  { kn: 'ಞ', rom: 'nya', en: 'nya', emoji: '🔔' },
  { kn: 'ಟ', rom: 'ta', en: 'hard ta (retroflex)', emoji: '🍅' },
  { kn: 'ಠ', rom: 'tha', en: 'hard tha', emoji: '🥁' },
  { kn: 'ಡ', rom: 'da', en: 'hard da', emoji: '🥁' },
  { kn: 'ಢ', rom: 'dha', en: 'hard dha', emoji: '🥁' },
  { kn: 'ಣ', rom: 'na', en: 'hard na (retroflex)', emoji: '🔔' },
  { kn: 'ತ', rom: 'ta', en: 'soft ta', emoji: '🌴' },
  { kn: 'ಥ', rom: 'tha', en: 'soft tha', emoji: '🌸' },
  { kn: 'ದ', rom: 'da', en: 'soft da', emoji: '🚪' },
  { kn: 'ಧ', rom: 'dha', en: 'soft dha', emoji: '💰' },
  { kn: 'ನ', rom: 'na', en: 'na', emoji: '👃' },
  { kn: 'ಪ', rom: 'pa', en: 'pa', emoji: '🌸' },
  { kn: 'ಫ', rom: 'pha', en: 'pha / fa', emoji: '🍎' },
  { kn: 'ಬ', rom: 'ba', en: 'ba', emoji: '🎈' },
  { kn: 'ಭ', rom: 'bha', en: 'bha', emoji: '🌍' },
  { kn: 'ಮ', rom: 'ma', en: 'ma', emoji: '🥭' },
  { kn: 'ಯ', rom: 'ya', en: 'ya', emoji: '🪢' },
  { kn: 'ರ', rom: 'ra', en: 'ra', emoji: '👑' },
  { kn: 'ಲ', rom: 'la', en: 'la', emoji: '🌿' },
  { kn: 'ವ', rom: 'va', en: 'va / wa', emoji: '🚐' },
  { kn: 'ಶ', rom: 'sha', en: 'palatal sha', emoji: '🐚' },
  { kn: 'ಷ', rom: 'sha', en: 'retroflex sha', emoji: '6️⃣' },
  { kn: 'ಸ', rom: 'sa', en: 'sa', emoji: '🌞' },
  { kn: 'ಹ', rom: 'ha', en: 'ha', emoji: '🦢' },
  { kn: 'ಳ', rom: 'la', en: 'retroflex la (unique Kannada sound)', emoji: '👅' },
]

/** Kali Kannada-2 akshara groups for non-native (Parichaya Bhashe) learners. */
export const KALI_GROUPS: { title: string; letters: string[] }[] = [
  { title: 'Group 1', letters: ['ರ', 'ಕ', 'ಸ', 'ದ', 'ಅ'] },
  { title: 'Group 2', letters: ['ಜ', 'ಎ', 'ಮ', 'ಬ', 'ನ'] },
  { title: 'Group 3', letters: ['ಪ', 'ಇ', 'ವ', 'ಲ'] },
  { title: 'Group 4', letters: ['ಯ', 'ಟ', 'ಈ', 'ಏ', 'ಕ'] },
  { title: 'Group 5', letters: ['ಒ', 'ಓ', 'ಔ', 'ಭ'] },
  { title: 'Group 6', letters: ['ಆ', 'ಉ', 'ತ', 'ಗ'] },
  { title: 'Group 7', letters: ['ಚ', 'ಹ', 'ಷ', 'ಶ'] },
  { title: 'Group 8', letters: ['ಖ', 'ಘ', 'ಛ', 'ಠ', 'ಫ'] },
  { title: 'Group 9', letters: ['ಊ', 'ಐ', 'ಋ', 'ಳ'] },
  { title: 'Group 10', letters: ['ಙ', 'ಞ', 'ಣ', 'ಝ', 'ಡ', 'ಢ'] },
]

export const KAGUNITA_KA: Word[] = [
  { kn: 'ಕ', rom: 'ka', en: 'ka', emoji: '🪷' },
  { kn: 'ಕಾ', rom: 'kaa', en: 'kaa', emoji: '🪷' },
  { kn: 'ಕಿ', rom: 'ki', en: 'ki', emoji: '🪷' },
  { kn: 'ಕೀ', rom: 'kee', en: 'kee', emoji: '🪷' },
  { kn: 'ಕು', rom: 'ku', en: 'ku', emoji: '🪷' },
  { kn: 'ಕೂ', rom: 'koo', en: 'koo', emoji: '🪷' },
  { kn: 'ಕೆ', rom: 'ke', en: 'ke', emoji: '🪷' },
  { kn: 'ಕೇ', rom: 'ke', en: 'long ke', emoji: '🪷' },
  { kn: 'ಕೈ', rom: 'kai', en: 'kai (hand)', emoji: '✋' },
  { kn: 'ಕೊ', rom: 'ko', en: 'ko', emoji: '🪷' },
  { kn: 'ಕೋ', rom: 'ko', en: 'long ko', emoji: '🪷' },
  { kn: 'ಕಂ', rom: 'kam', en: 'kam', emoji: '🪷' },
]

export function letterByKn(kn: string): Word {
  const all = [...SWARAS, ...VYANJANAS]
  const found = all.find((l) => l.kn === kn)
  if (!found) {
    return { kn, rom: kn, en: kn, emoji: '🔤' }
  }
  return found
}

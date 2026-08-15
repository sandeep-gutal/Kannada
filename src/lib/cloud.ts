import { mergeMemory, normalizeMemory, saveMemory } from './progress'
import { FAMILY_DOC_URL } from './cloudConfig'
import { isValidPin } from './pins'
import type { AppMemory } from '../types'

type CloudDoc = {
  v: number
  savedAt: string
  memory: AppMemory
}

function stripId(doc: Record<string, unknown>): Record<string, unknown> {
  const copy = { ...doc }
  delete copy._id
  return copy
}

async function readDoc(url: string, pin: string): Promise<AppMemory | null> {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'X-Kali-Pin': pin },
  })
  if (!res.ok) return null
  const data = (await res.json()) as CloudDoc & { profiles?: AppMemory['profiles'] }
  const memory = data.memory ?? data
  if (!memory || typeof memory !== 'object' || !('profiles' in memory) || !memory.profiles) {
    return null
  }
  return normalizeMemory(memory)
}

async function writeDoc(url: string, pin: string, memory: AppMemory): Promise<boolean> {
  const doc: CloudDoc = {
    v: 1,
    savedAt: new Date().toISOString(),
    memory,
  }
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Kali-Pin': pin,
    },
    body: JSON.stringify(stripId(doc as unknown as Record<string, unknown>)),
  })
  return res.ok
}

export async function pullCloud(pin: string): Promise<AppMemory | null> {
  if (!isValidPin(pin)) return null
  const urls = ['/api/sync', FAMILY_DOC_URL]
  for (const url of urls) {
    try {
      const memory = await readDoc(url, pin)
      if (memory) return memory
    } catch {
      /* try next host */
    }
  }
  return null
}

export async function pushCloud(pin: string, memory: AppMemory): Promise<boolean> {
  if (!isValidPin(pin)) return false
  const urls = ['/api/sync', FAMILY_DOC_URL]
  for (const url of urls) {
    try {
      if (await writeDoc(url, pin, memory)) return true
    } catch {
      /* try next host */
    }
  }
  return false
}

export async function syncFamily(pin: string, local: AppMemory): Promise<AppMemory> {
  const cloud = await pullCloud(pin)
  const merged = cloud ? mergeMemory(cloud, local) : local
  const saved = saveMemory(merged)
  await pushCloud(pin, saved)
  return saved
}

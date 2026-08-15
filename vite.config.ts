import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import type { IncomingMessage } from 'node:http'

const FAMILY_DOC_URL =
  'https://crudcrud.com/api/41e87b1cf1a344b8a7fd2b252ca944cd/family/6a805a20cff2e703e8744dbd'

function isFamilyPin(pin: string | string[] | undefined): boolean {
  const value = Array.isArray(pin) ? pin[0] : pin
  return value === '01' || value === '02' || value === '03' || value === '04'
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function kaliSyncPlugin(): Plugin {
  return {
    name: 'kali-family-sync',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url !== '/api/sync') {
          next()
          return
        }
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }
        const pin = String(req.headers['x-kali-pin'] ?? '')
        if (!isFamilyPin(pin)) {
          res.statusCode = 401
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Need 01, 02, 03, or 04' }))
          return
        }
        try {
          if (req.method === 'GET') {
            const remote = await fetch(FAMILY_DOC_URL, { headers: { Accept: 'application/json' } })
            res.statusCode = remote.status
            res.setHeader('Content-Type', 'application/json')
            res.end(await remote.text())
            return
          }
          if (req.method === 'PUT') {
            const body = await readBody(req)
            const remote = await fetch(FAMILY_DOC_URL, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body,
            })
            res.statusCode = remote.ok ? 200 : remote.status
            res.setHeader('Content-Type', 'application/json')
            res.end(remote.ok ? JSON.stringify({ ok: true }) : await remote.text())
            return
          }
          res.statusCode = 405
          res.end('Method not allowed')
        } catch (error) {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: String(error) }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), kaliSyncPlugin()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
})

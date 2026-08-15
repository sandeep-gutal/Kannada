import { FAMILY_DOC_URL } from '../src/lib/cloudConfig'
import { isValidPin } from '../src/lib/pins'

export const config = { runtime: 'edge' }

function deny(): Response {
  return new Response(JSON.stringify({ error: 'Need a family password: 01, 02, 03, or 04' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Kali-Pin',
      },
    })
  }

  const pin = req.headers.get('X-Kali-Pin')
  if (!isValidPin(pin)) return deny()

  if (req.method === 'GET') {
    const res = await fetch(FAMILY_DOC_URL, { headers: { Accept: 'application/json' } })
    const text = await res.text()
    return new Response(text, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  if (req.method === 'PUT') {
    const body = await req.text()
    const res = await fetch(FAMILY_DOC_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body,
    })
    return new Response(res.ok ? JSON.stringify({ ok: true }) : await res.text(), {
      status: res.ok ? 200 : res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  return new Response('Method not allowed', { status: 405 })
}

#!/usr/bin/env npx tsx
/**
 * Validates a muapi.ai key and connection by submitting a minimal image generation.
 * Usage: npx tsx apps/web/scripts/validate-muapi.ts
 * Requires MUAPI_DEFAULT_KEY in .env.local or as an environment variable.
 */

import * as fs from 'fs'
import * as path from 'path'

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...rest] = trimmed.split('=')
    if (key && rest.length > 0) {
      process.env[key.trim()] = rest.join('=').trim()
    }
  }
}

const BASE = process.env.MUAPI_BASE_URL || 'https://api.muapi.ai'
const KEY = process.env.MUAPI_DEFAULT_KEY

if (!KEY) {
  console.error('❌ MUAPI_DEFAULT_KEY not found in .env.local or environment.')
  console.error('   Copy .env.local.template to .env.local and set MUAPI_DEFAULT_KEY.')
  process.exit(1)
}

async function poll(id: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const wait = Math.min(2000 + i * 500, 10000)
    await new Promise(r => setTimeout(r, wait))
    process.stdout.write('.')
    const r = await fetch(`${BASE}/api/v1/status/${id}`, { headers: { 'x-api-key': KEY! } })
    if (!r.ok) {
      throw new Error(`Status check failed: HTTP ${r.status} — ${await r.text()}`)
    }
    const d = await r.json() as { status: string; output?: string; error?: string }
    if (d.status === 'completed' && d.output) return d.output
    if (d.status === 'failed') throw new Error(d.error || 'Generation failed')
  }
  throw new Error('Timed out after 5 minutes')
}

async function main() {
  console.log(`\n🔍 Validating muapi.ai connection...`)
  console.log(`   Base URL : ${BASE}`)
  console.log(`   Key      : ${KEY!.slice(0, 8)}...${KEY!.slice(-4)}\n`)

  const payload = {
    prompt: 'a single green leaf on white background, minimal, studio photography',
    aspect_ratio: '1:1',
    model: 'flux-dev',
  }

  console.log('📤 Submitting test generation (flux-dev, 1:1)...')
  const submitRes = await fetch(`${BASE}/api/v1/flux-dev`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': KEY! },
    body: JSON.stringify(payload),
  })

  if (!submitRes.ok) {
    const body = await submitRes.text()
    if (submitRes.status === 401) {
      console.error('\n❌ Invalid muapi key. Check MUAPI_DEFAULT_KEY in .env.local.')
    } else if (submitRes.status === 422) {
      console.error('\n❌ Unsupported model or params. The muapi API contract may differ.')
      console.error(`   Response: ${body}`)
    } else {
      console.error(`\n❌ Submit failed: HTTP ${submitRes.status}`)
      console.error(`   Response: ${body}`)
    }
    process.exit(1)
  }

  const submitted = await submitRes.json() as { request_id?: string; id?: string }
  const jobId = submitted.request_id || submitted.id
  if (!jobId) {
    console.error('❌ No job ID in response:', JSON.stringify(submitted))
    process.exit(1)
  }

  console.log(`✓ Job submitted: ${jobId}`)
  console.log('⏳ Polling for result', { noNewline: true })
  process.stdout.write('   ')

  const resultUrl = await poll(jobId)
  console.log('\n')
  console.log('✅ SUCCESS')
  console.log(`   Result URL: ${resultUrl}`)
  console.log('\nYour muapi key is valid and generation works correctly.\n')
}

main().catch(err => {
  console.error(`\n❌ Validation failed: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
})

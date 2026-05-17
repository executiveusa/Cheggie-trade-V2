const STORAGE_KEY = 'synthia_provider_keys_v2'
const SESSION_ENC_KEY = 'synthia_enc_key'

export interface ProviderDef {
  id: string
  label: string
  placeholder: string
  docs: string
  required: boolean
}

export const PROVIDERS: ProviderDef[] = [
  { id: 'muapi', label: 'Synthia™ Studio (muapi)', placeholder: 'muapi-...', docs: 'https://muapi.ai', required: true },
  { id: 'openai', label: 'OpenAI (ChatGPT / GPT-4o)', placeholder: 'sk-...', docs: 'https://platform.openai.com/api-keys', required: false },
  { id: 'anthropic', label: 'Anthropic (Claude)', placeholder: 'sk-ant-...', docs: 'https://console.anthropic.com', required: false },
  { id: 'google', label: 'Google (Gemini)', placeholder: 'AIza...', docs: 'https://aistudio.google.com', required: false },
  { id: 'elevenlabs', label: 'ElevenLabs (Voz / Voice)', placeholder: 'el-...', docs: 'https://elevenlabs.io', required: false },
]

// ── AES-GCM encryption using Web Crypto API ───────────────────

async function getEncKey(): Promise<CryptoKey> {
  let raw = sessionStorage.getItem(SESSION_ENC_KEY)
  if (!raw) {
    const bytes = crypto.getRandomValues(new Uint8Array(32))
    raw = btoa(String.fromCharCode(...bytes))
    sessionStorage.setItem(SESSION_ENC_KEY, raw)
  }
  const keyBytes = Uint8Array.from(atob(raw), c => c.charCodeAt(0))
  return crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

async function encrypt(plaintext: string): Promise<string> {
  const key = await getEncKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), iv.length)
  return btoa(String.fromCharCode(...combined))
}

async function decrypt(ciphertext: string): Promise<string | null> {
  try {
    const key = await getEncKey()
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0))
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
    return new TextDecoder().decode(plaintext)
  } catch {
    return null
  }
}

function loadRaw(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

export async function saveKey(provider: string, value: string): Promise<void> {
  const raw = loadRaw()
  raw[provider] = await encrypt(value)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(raw))
}

export async function getKey(provider: string): Promise<string | null> {
  const raw = loadRaw()
  const enc = raw[provider]
  if (!enc) return null
  const decrypted = await decrypt(enc)
  if (decrypted === null) {
    // Session key rotated — remove stale entry
    delete raw[provider]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw))
    return null
  }
  return decrypted
}

export async function getAllKeys(): Promise<Record<string, string>> {
  const raw = loadRaw()
  const result: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw)) {
    const dec = await decrypt(v)
    if (dec !== null) result[k] = dec
  }
  return result
}

export function removeKey(provider: string): void {
  const raw = loadRaw()
  delete raw[provider]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(raw))
}

export async function hasRequiredKeys(): Promise<boolean> {
  return !!(await getKey('muapi'))
}

export function maskKey(value: string): string {
  if (value.length <= 8) return '••••••••'
  return value.slice(0, 4) + '••••••••••••••••••••••••' + value.slice(-4)
}

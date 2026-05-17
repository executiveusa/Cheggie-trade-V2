const STORAGE_KEY = 'synthia_provider_keys_encrypted'
const PBKDF2_SALT_KEY = 'synthia_provider_keys_salt'

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function deriveAesKey(masterPassword: string, salt: Uint8Array): Promise<CryptoKey> {
  const passwordBytes = new TextEncoder().encode(masterPassword)
  const baseKey = await crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

function getOrCreateSalt(): Uint8Array {
  const saved = localStorage.getItem(PBKDF2_SALT_KEY)
  if (saved) return base64ToBytes(saved)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  localStorage.setItem(PBKDF2_SALT_KEY, bytesToBase64(salt))
  return salt
}

export async function saveEncryptedKeys(keysObj: Record<string, string>, masterPassword: string): Promise<void> {
  if (typeof window === 'undefined') return
  const salt = getOrCreateSalt()
  const key = await deriveAesKey(masterPassword, salt)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const payload = new TextEncoder().encode(JSON.stringify(keysObj))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, payload)
  localStorage.setItem(STORAGE_KEY, `${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(encrypted))}`)
}

export async function loadEncryptedKeys(masterPassword: string): Promise<Record<string, string>> {
  if (typeof window === 'undefined') return {}
  const packed = localStorage.getItem(STORAGE_KEY)
  if (!packed) return {}

  try {
    const [ivB64, cipherB64] = packed.split('.')
    const salt = getOrCreateSalt()
    const key = await deriveAesKey(masterPassword, salt)
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(ivB64) },
      key,
      base64ToBytes(cipherB64)
    )
    return JSON.parse(new TextDecoder().decode(decrypted))
  } catch {
    return {}
  }
}

const REQUIRED_SERVER_VARS = [
  'ANTHROPIC_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

const REQUIRED_CLIENT_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

export function validateServerEnv() {
  // Skip validation during next build static analysis phase
  if (process.env.NEXT_PHASE === 'phase-production-build') return
  const missing: string[] = []
  for (const key of REQUIRED_SERVER_VARS) {
    if (!process.env[key]) missing.push(key)
  }
  if (missing.length > 0) {
    throw new Error(
      `[Synthia] Missing required environment variables:\n${missing.map(k => `  • ${k}`).join('\n')}\n\nCopy .env.example to .env.local and fill in all values.`
    )
  }
}

export function validateClientEnv() {
  const missing: string[] = []
  for (const key of REQUIRED_CLIENT_VARS) {
    if (!process.env[key]) missing.push(key)
  }
  if (missing.length > 0) {
    console.error(
      `[Synthia] Missing required public environment variables:\n${missing.map(k => `  • ${k}`).join('\n')}`
    )
  }
}

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  anthropicKey: process.env.ANTHROPIC_API_KEY,
  muapiDefaultKey: process.env.MUAPI_DEFAULT_KEY,
  screenshotoneKey: process.env.SCREENSHOTONE_KEY,
  creemWebhookSecret: process.env.CREEM_WEBHOOK_SECRET,
  creemStarterId: process.env.CREEM_STARTER_ID,
  creemProId: process.env.CREEM_PRO_ID,
  creemOperatorId: process.env.CREEM_OPERATOR_ID,
  whatsappToken: process.env.WHATSAPP_TOKEN,
  whatsappPhoneId: process.env.WHATSAPP_PHONE_ID,
  whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const

import { NextResponse } from 'next/server'

export async function GET() {
  // Client-side export is handled via the store
  // This route provides a server-side alternative for authenticated users
  return NextResponse.json(
    { message: 'Use client-side export from the brain page or authenticate to access server export.' },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

import { NextResponse } from 'next/server'

// This is a simple in-memory store. In a real application, you'd use a database.
let visitorCount = 0
let lastResetDate = new Date().toDateString()

export async function GET() {
  const today = new Date().toDateString()
  
  // Reset the count if it's a new day
  if (today !== lastResetDate) {
    visitorCount = 0
    lastResetDate = today
  }

  visitorCount++

  return NextResponse.json({ count: visitorCount })
}

import { NextResponse } from 'next/server'
import { cachedFetch } from '@/app/api/utils/cache'

const API_KEY = process.env.EXCHANGERATE_API_KEY

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const data = await cachedFetch('exchangerate', async () => {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate data')
      }
      return await response.json()
    })
    
    return NextResponse.json({
      price: data.conversion_rates.KRW
    });
  } catch (error) {
    console.error('Error fetching exchnage rate:', error)
    return NextResponse.json({ error: 'Failed to fetch exchange rate data' }, { status: 500 })
  }
}

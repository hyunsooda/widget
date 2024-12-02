import { NextResponse } from 'next/server'
import { cachedFetch } from '@/app/api/utils/cache'

const API_KEY = process.env.COINMARKETCAP_API_KEY
const CRYPTO_IDS = {
  bitcoin: '1',
  ethereum: '1027',
  kaia: '32880'  // Note: This ID might not be correct. Please verify the correct ID for Kaia.
}

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const prices = await cachedFetch('crypto', async () => {
      const response = await fetch(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?convert=KRW&id=${Object.values(CRYPTO_IDS).join(',')}`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': API_KEY,
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch cryptocurrency data')
      }

      const data = await response.json()
      return Object.entries(CRYPTO_IDS).reduce((acc, [name, id]) => {
        acc[name] = data.data[id].quote.KRW.price
        return acc
      }, {} as Record<string, number>)
    })

    return NextResponse.json(prices)
  } catch (error) {
    console.error('Error fetching cryptocurrency prices:', error)
    return NextResponse.json({ error: 'Failed to fetch cryptocurrency prices' }, { status: 500 })
  }
}

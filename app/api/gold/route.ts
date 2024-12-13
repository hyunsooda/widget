import { NextResponse } from 'next/server'
import axios from 'axios';

// Replace with your own API keys
const GOLD_API_KEY = process.env.GOLD_API_KEY

export async function GET() {
  try {
    const [goldPriceResponse, exchangeRateResponse] = await Promise.all([
      axios.get('https://www.goldapi.io/api/XAU/USD', {
        headers: {
          'x-access-token': GOLD_API_KEY,
        },
      }),
      fetch('https://api.exchangerate-api.com/v4/latest/USD')
    ])

    if (!exchangeRateResponse.ok) {
      throw new Error('Failed to fetch exchange rate')
    }

    const exchangeRateData = await exchangeRateResponse.json()
    const usdToKrw = exchangeRateData.rates.KRW
    const goldPriceInUsd = goldPriceResponse.data.price

    const goldPriceInKrw = Math.round(goldPriceInUsd * usdToKrw);
    return NextResponse.json({
      price: goldPriceInKrw
    });
  } catch (error) {
    console.error('Error fetching gold price or exchange rate:', error);
    throw error;
  }
}

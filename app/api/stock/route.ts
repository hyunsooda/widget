import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'

const SYMBOLS = {
  SAMSUNG: '005930.KS',
  GOOGLE: 'GOOGL',
  META: 'META',
  NVIDIA: 'NVDA',
  MICROSOFT: 'MSFT'
}

export async function GET() {
  try {
    const [stockData, exchangeRateResponse] = await Promise.all([
      Promise.all(
        Object.entries(SYMBOLS).map(async ([name, symbol]) => {
          const quote = await yahooFinance.quote(symbol)
          return { [name.toLowerCase()]: quote.regularMarketPrice }
        })
      ),
      fetch('https://api.exchangerate-api.com/v4/latest/USD')
    ])

    if (!exchangeRateResponse.ok) {
      throw new Error('Failed to fetch exchange rate')
    }

    const exchangeRateData = await exchangeRateResponse.json()
    const usdToKrw = exchangeRateData.rates.KRW

    const convertedStockData = stockData.reduce((acc, stock) => {
      const [name, price] = Object.entries(stock)[0]
      const priceInKRW = name === 'samsung' ? price : price * usdToKrw
      acc[name] = Math.round(priceInKRW)
      return acc
    }, {})

    return NextResponse.json(convertedStockData)
  } catch (error) {
    console.error('Error fetching stock prices:', error)
    return NextResponse.json({ error: 'Failed to fetch stock prices' }, { status: 500 })
  }
}

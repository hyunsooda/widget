import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2';

const SAMSUNG_SYMBOL = '005930.KS'  // Samsung Electronics stock symbol on the Korean Stock Exchange

export async function GET() {
  try {
    const stock = await yahooFinance.quote(SAMSUNG_SYMBOL);
    return NextResponse.json({
      price: stock.regularMarketPrice,
    })
  } catch (error) {
    console.error('Error fetching stock price:', error)
    return NextResponse.json({ error: 'Failed to fetch stock price' }, { status: 500 })
  }
}



import { NextResponse } from 'next/server'

const API_KEY = process.env.OPENWEATHERMAP_API_KEY
const SEOUL_CITY_ID = '1835848'

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?id=${SEOUL_CITY_ID}&appid=${API_KEY}&units=metric`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch weather data')
    }

    const data = await response.json()

    return NextResponse.json({
      weather: `${data.weather[0].main}, ${Math.round(data.main.temp)}°C`,
    })
  } catch (error) {
    console.error('Error fetching weather:', error)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}

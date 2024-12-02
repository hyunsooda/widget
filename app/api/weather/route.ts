import { NextResponse } from 'next/server'
import { cachedFetch } from '@/app/api/utils/cache'

const API_KEY = process.env.OPENWEATHERMAP_API_KEY
const SEOUL_CITY_ID = '1835848'

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const weatherData = await cachedFetch('weather', async () => {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?id=${SEOUL_CITY_ID}&appid=${API_KEY}&units=metric`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch weather data')
      }

      const data = await response.json()
      return {
        weather: `${data.weather[0].main}, ${Math.round(data.main.temp)}°C`,
      }
    })

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error('Error fetching weather:', error)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}

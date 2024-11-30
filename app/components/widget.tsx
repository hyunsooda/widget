"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from 'lucide-react'

interface WidgetData {
  weather: string
  samsungStock: number
  exchangeRate: number
  cryptoPrices: {
    bitcoin: number
    ethereum: number
    kaia: number
  }
}

export default function Widget() {
  const [data, setData] = useState<WidgetData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    
    const fetchData = async () => {
      try {
        const [weatherResponse, cryptoResponse, stockResponse, exchangeRateResponse] = await Promise.all([
          fetch('/api/weather'),
          fetch('/api/crypto'),
          fetch('/api/stock'),
          fetch('/api/exchangerate')
        ])

        if (!weatherResponse.ok || !cryptoResponse.ok || !stockResponse.ok || !exchangeRateResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const weatherData = await weatherResponse.json()
        const cryptoData = await cryptoResponse.json()
        const stockData = await stockResponse.json()
        const exchangeRateData = await exchangeRateResponse.json()

        setData({
          weather: weatherData.weather,
          samsungStock: stockData.price,
          exchangeRate: exchangeRateData.price,
          cryptoPrices: {
            bitcoin: cryptoData.bitcoin,
            ethereum: cryptoData.ethereum,
            kaia: cryptoData.kaia,
          },
        })
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data. Please try again later.')
        setData(null)
      }
    }

    fetchData()
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hyunsoo's Personal Widget</CardTitle>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <InfoItem
              title="Seoul Weather"
              value={data?.weather}
              loading={!data}
            />
            <InfoItem
              title="Samsung Stock Price"
              value={data ? `₩${data.samsungStock.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : undefined}
              loading={!data}
            />
            <InfoItem
              title="KRW to USD Exchange Rate"
              value={data ? `₩${data.exchangeRate.toFixed(2)} = $1` : undefined}
              loading={!data}
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cryptocurrency Prices</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <InfoItem
                  title="Bitcoin"
                  value={data ? `$${data.cryptoPrices.bitcoin.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : undefined}
                  loading={!data}
                />
                <InfoItem
                  title="Ethereum"
                  value={data ? `$${data.cryptoPrices.ethereum.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : undefined}
                  loading={!data}
                />
                <InfoItem
                  title="Kaia"
                  value={data ? `$${data.cryptoPrices.kaia.toFixed(0)}` : undefined}
                  loading={!data}
                />
              </CardContent>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function InfoItem({ title, value, loading }: { title: string; value?: string; loading: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium">{title}</span>
      {loading ? (
        <Skeleton className="h-4 w-[100px]" />
      ) : (
        <span className="text-sm font-bold">{value}</span>
      )}
    </div>
  )
}



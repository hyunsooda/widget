"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Github, MessageSquarePlus, RefreshCw, Users } from 'lucide-react'
import Link from 'next/link'

interface WidgetData {
  weather: string
  samsungStock: number
  exchangeRate: number
  cryptoPrices: {
    bitcoin: number
    ethereum: number
    kaia: number
  }
  visitorCount: number
}

export default function KoreaInfoWidget() {
  const [data, setData] = useState<WidgetData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [currentDateTime, setCurrentDateTime] = useState<string>('')

  useEffect(() => {
    setMounted(true)

    const fetchData = async () => {
      try {
        const [weatherResponse, cryptoResponse, stockResponse, exchangeRateResponse, visitorResponse] = await Promise.all([
          fetch('/api/weather'),
          fetch('/api/crypto'),
          fetch('/api/stock'),
          fetch('/api/exchangerate'),
          fetch('/api/visitors')
        ])

        if (!weatherResponse.ok || !cryptoResponse.ok || !stockResponse.ok || !exchangeRateResponse.ok || !visitorResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const weatherData = await weatherResponse.json()
        const cryptoData = await cryptoResponse.json()
        const stockData = await stockResponse.json()
        const exchangeRateData = await exchangeRateResponse.json()
        const visitorData = await visitorResponse.json()

        setData({
          weather: weatherData.weather,
          samsungStock: stockData.price,
          exchangeRate: exchangeRateData.price,
          cryptoPrices: {
            bitcoin: cryptoData.bitcoin,
            ethereum: cryptoData.ethereum,
            kaia: cryptoData.kaia,
          },
          visitorCount: visitorData.count
        })
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data. Please try again later.')
        setData(null)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const dateOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
      const timeOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Seoul',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }
      const dateString = now.toLocaleDateString('ko-KR', dateOptions)
      const timeString = now.toLocaleTimeString('ko-KR', timeOptions)
      setCurrentDateTime(`${dateString} ${timeString}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-col items-start justify-between space-y-2">
        <div className="flex w-full justify-between items-center">
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
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">KST: {currentDateTime}</p>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          <span>API fetcher updates widget information every 5 min</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>Visitors today: {data?.visitorCount ?? <Skeleton className="h-4 w-[30px] inline-block" />}</span>
        </div>
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
                  value={data ? `$${data.cryptoPrices.bitcoin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : undefined}
                  loading={!data}
                />
                <InfoItem
                  title="Ethereum"
                  value={data ? `$${data.cryptoPrices.ethereum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : undefined}
                  loading={!data}
                />
                <InfoItem
                  title="Kaia"
                  value={data ? `$${data.cryptoPrices.kaia.toFixed(4)}` : undefined}
                  loading={!data}
                />
              </CardContent>
            </Card>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center space-y-4 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Have a new item request?</p>
        </div>
        <Link
          href="https://github.com/hyunsooda/widget/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary hover:underline"
        >
          Submit an issue or PR on GitHub
        </Link>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Github className="h-4 w-4" />
          <Link
            href="https://github.com/hyunsooda/widget"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            View source
          </Link>
          <span>•</span>
          <span>Maintained by Hyunsoo Shin</span>
        </div>
      </CardFooter>
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

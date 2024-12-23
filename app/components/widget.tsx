"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Github, MessageSquarePlus, RefreshCw, Users, Thermometer } from 'lucide-react'
import Link from 'next/link'

interface WidgetData {
  weather: string
  samsungStock: number
  googleStock: number
  metaStock: number
  nvidiaStock: number
  microsoftStock: number
  goldPrice: number | null
  exchangeRateKRW: number
  exchangeRateJPY: number
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
        const [weatherResponse, cryptoResponse, stockResponse, exchangeRateResponse, visitorResponse, goldResponse] = await Promise.all([
          fetch('/api/weather'),
          fetch('/api/crypto'),
          fetch('/api/stock'),
          fetch('/api/exchangerate'),
          fetch('/api/visitors'),
          fetch('/api/gold')
        ])

        if (!weatherResponse.ok || !cryptoResponse.ok || !stockResponse.ok || !exchangeRateResponse.ok || !visitorResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const weatherData = await weatherResponse.json()
        const cryptoData = await cryptoResponse.json()
        const stockData = await stockResponse.json()
        const exchangeRateData = await exchangeRateResponse.json()
        const visitorData = await visitorResponse.json()
        const goldData = goldResponse.ok ? await goldResponse.json() : { price: null }

        setData({
          weather: weatherData.weather,
          samsungStock: stockData.samsung,
          googleStock: stockData.google,
          metaStock: stockData.meta,
          nvidiaStock: stockData.nvidia,
          microsoftStock: stockData.microsoft,
          goldPrice: goldData.price,
          exchangeRateKRW: exchangeRateData.KRW,
          exchangeRateJPY: exchangeRateData.JPY,
          cryptoPrices: {
            bitcoin: cryptoData.bitcoin,
            ethereum: cryptoData.ethereum,
            kaia: cryptoData.kaia,
          },
          visitorCount: visitorData.count
        })
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load some data. Please try again later.')
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
    <Card className="w-full max-w-md mx-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl">
      <CardHeader className="flex flex-col items-start justify-between space-y-2">
        <div className="flex w-full justify-between items-center">
          <CardTitle className="text-base sm:text-lg md:text-xl">Hyunsoo's Personal Widget</CardTitle>
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
        <div className="flex items-center space-x-2 text-sm">
          <Thermometer className="h-4 w-4 text-muted-foreground" />
          <span>Seoul Weather: {data?.weather}</span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Exchane Rate</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <InfoItem
                  title="KRW to USD Exchange Rate"
                  value={data ? `₩${data.exchangeRateKRW.toFixed(2)} = $1` : undefined}
                  loading={!data}
                />
                <InfoItem
                  title="JPY to USD Exchange Rate"
                  value={data ? `¥${data.exchangeRateJPY.toFixed(2)} = $1` : undefined}
                  loading={!data}
                />
                <InfoItem
                  title="Gold Price (KRW/oz)"
                  value={data?.goldPrice ? `₩${data.goldPrice.toLocaleString()}` : 'Unavailable'}
                  loading={!data}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Stock Prices (KRW)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <InfoItem
                  title="Samsung"
                  value={data ? `₩${data.samsungStock.toLocaleString()}` : undefined}
                  loading={!data}
                />
                <InfoItem
                  title="Google"
                  value={data ? `₩${data.googleStock.toLocaleString()}` : undefined}
                  loading={!data}
                />
                <InfoItem
                  title="Meta"
                  value={data ? `₩${data.metaStock.toLocaleString()}` : undefined}
                  loading={!data}
                />
                <InfoItem
                  title="NVIDIA"
                  value={data ? `₩${data.nvidiaStock.toLocaleString()}` : undefined}
                  loading={!data}
                />
                <InfoItem
                  title="Microsoft"
                  value={data ? `₩${data.microsoftStock.toLocaleString()}` : undefined}
                  loading={!data}
                />
              </CardContent>
            </Card>  
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cryptocurrency Prices (KRW)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <InfoItem
                  title="Bitcoin"
                  value={data ? `₩${Math.round(data.cryptoPrices.bitcoin).toLocaleString()}` : undefined}
                  loading={!data}
                />
                <InfoItem
                  title="Ethereum"
                  value={data ? `₩${Math.round(data.cryptoPrices.ethereum).toLocaleString()}` : undefined}
                  loading={!data}
                />
                <InfoItem
                  title="Kaia"
                  value={data ? `₩${Math.round(data.cryptoPrices.kaia).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : undefined}
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
          <p className="text-sm text-muted-foreground">Have a feature request?</p>
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
          <span>Developed by Hyunsoo Shin</span>
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

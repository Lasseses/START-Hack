"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ApexOptions } from "apexcharts"

// Dynamischer Import, um SSR-Probleme zu vermeiden
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface CandleStickChartProps {
  candlestickData: {
    x: string | number | Date
    y: [number, number, number, number]
    volume?: number
    title?: string
  }[]
  title?: string // Add title prop
}

export default function CandleStickChart({ candlestickData, title = "Candlestick Chart" }: CandleStickChartProps) {
  const [timeframe, setTimeframe] = useState<string>("all")

  // Daten nach Zeitraum filtern
  const getFilteredData = () => {
    if (timeframe === "all") return candlestickData

    const now = new Date()
    const cutoffDate = new Date()

    switch (timeframe) {
      case "1m":
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case "3m":
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      case "6m":
        cutoffDate.setMonth(now.getMonth() - 6)
        break
      case "1y":
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        return candlestickData
    }

    return candlestickData.filter((item) => {
      const itemDate = new Date(item.x)
      return itemDate >= cutoffDate
    })
  }

  const filteredData = getFilteredData()

  // Volumen-Daten extrahieren
  const volumeData = filteredData.map((item) => ({
    x: item.x,
    y: item.volume || 0,
  }))

  // Berechne min/max für bessere Y-Achsen-Skalierung
  const allPrices = filteredData.flatMap((item) => item.y)
  const minPrice = Math.min(...allPrices) * 0.995 // 0.5% Puffer nach unten
  const maxPrice = Math.max(...allPrices) * 1.005 // 0.5% Puffer nach oben

  // Candlestick Chart Optionen
  const candlestickOptions: ApexOptions = {
    chart: {
      type: "candlestick",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
        autoSelected: "zoom",
      },
      animations: {
        enabled: false,
      },
      background: "transparent",
      fontFamily: "Inter, sans-serif",
      id: "candles",
    },
  
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 2,
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#10b981",
          downward: "#ef4444",
        },
        wick: {
          useFillColor: true,
        },
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
        style: {
          colors: "#64748b",
          fontSize: "12px",
        },
        format: "dd.MM.yy",
      },
      axisBorder: {
        show: true,
        color: "#e2e8f0",
      },
      axisTicks: {
        show: true,
        color: "#e2e8f0",
      },
    },
    yaxis: {
      min: minPrice,
      max: maxPrice,
      tickAmount: 6,
      labels: {
        formatter: (value) => value.toFixed(2),
        style: {
          colors: "#64748b",
          fontSize: "12px",
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    tooltip: {
      enabled: true,
      theme: "light",
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
      },
      x: {
        format: "dd MMM yyyy",
      },
      y: {
        formatter: (value) => `${value.toFixed(2)}`,
      },
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const o = w.globals.seriesCandleO[seriesIndex][dataPointIndex]
        const h = w.globals.seriesCandleH[seriesIndex][dataPointIndex]
        const l = w.globals.seriesCandleL[seriesIndex][dataPointIndex]
        const c = w.globals.seriesCandleC[seriesIndex][dataPointIndex]
        const vol = volumeData[dataPointIndex]?.y || 0

        const date = new Date(w.globals.seriesX[seriesIndex][dataPointIndex])
        const formattedDate = date.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })

        const change = c - o
        const changePercent = (((c - o) / o) * 100).toFixed(2)
        const changeColor = change >= 0 ? "#10b981" : "#ef4444"

        return `
          <div class="apexcharts-tooltip-title" style="font-family: Inter, sans-serif; font-size: 14px; font-weight: 600; margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px solid #e2e8f0;">
            ${formattedDate}
          </div>
          <div style="padding: 5px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #64748b; font-size: 12px;">Eröffnung:</span>
              <span style="font-weight: 500; font-size: 12px;">${o.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #64748b; font-size: 12px;">Hoch:</span>
              <span style="font-weight: 500; font-size: 12px;">${h.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #64748b; font-size: 12px;">Tief:</span>
              <span style="font-weight: 500; font-size: 12px;">${l.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #64748b; font-size: 12px;">Schluss:</span>
              <span style="font-weight: 500; font-size: 12px;">${c.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #64748b; font-size: 12px;">Volumen:</span>
              <span style="font-weight: 500; font-size: 12px;">${vol.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 5px; padding-top: 5px; border-top: 1px solid #e2e8f0;">
              <span style="color: #64748b; font-size: 12px;">Änderung:</span>
              <span style="font-weight: 500; font-size: 12px; color: ${changeColor};">
                ${change >= 0 ? "+" : ""}${change.toFixed(2)} (${change >= 0 ? "+" : ""}${changePercent}%)
              </span>
            </div>
          </div>
        `
      },
    },
    theme: {
      mode: "light",
      palette: "palette1",
    },
    annotations: {
      position: "front",
    },
  }

  // Volumen Chart Optionen
  const volumeOptions: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
      background: "transparent",
      fontFamily: "Inter, sans-serif",
      id: "volume",
      brush: {
        enabled: true,
        target: "candles",
      },
      selection: {
        enabled: true,
        xaxis: {
          min: new Date(filteredData[0]?.x || new Date()).getTime(),
          max: new Date(filteredData[filteredData.length - 1]?.x || new Date()).getTime(),
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        columnWidth: "80%",
        colors: {
          ranges: [
            {
              from: -1000000000,
              to: 0,
              color: "#ef4444",
            },
            {
              from: 1,
              to: 1000000000,
              color: "#10b981",
            },
          ],
        },
      },
    },
    stroke: {
      width: 0,
    },
    xaxis: {
      type: "datetime",
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          colors: "#64748b",
          fontSize: "10px",
        },
        formatter: (val) => {
          if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
          if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
          return val.toString()
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: "light",
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
      },
      x: {
        format: "dd MMM yyyy",
      },
      y: {
        formatter: (value) => value.toLocaleString(),
      },
    },
    grid: {
      show: false,
    },
  }

  return (
    <Card className="border-slate-200 shadow-md h-[40vh] min-h-[320px]">
      <CardHeader className="bg-slate-50 border-b border-slate-200 pb-2 h-auto  bg-gradient-to-br from-indigo-500/10 to-cyan-500/10">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-slate-800 text-xl">{title}</CardTitle>
          </div>
          <Tabs defaultValue="all" value={timeframe} onValueChange={setTimeframe} className="w-auto">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="1m" className="text-xs px-2 py-1">
                1M
              </TabsTrigger>
              <TabsTrigger value="3m" className="text-xs px-2 py-1">
                3M
              </TabsTrigger>
              <TabsTrigger value="6m" className="text-xs px-2 py-1">
                6M
              </TabsTrigger>
              <TabsTrigger value="1y" className="text-xs px-2 py-1">
                1J
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs px-2 py-1">
                Max
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-2 flex flex-col h-[calc(100%-60px)]">
        <div className="h-[70%]">
          <ReactApexChart
            options={candlestickOptions}
            series={[{ data: filteredData }]}
            type="candlestick"
            height="100%"
            width="100%"
          />
        </div>
        <div className="h-[30%] mt-1">
          <ReactApexChart
            options={volumeOptions}
            series={[{ name: "Volumen", data: volumeData }]}
            type="bar"
            height="100%"
            width="100%"
          />
        </div>
      </CardContent>
    </Card>
  )
}
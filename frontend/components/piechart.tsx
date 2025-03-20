"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ApexOptions } from "apexcharts"

// Dynamischer Import von ReactApexChart, damit dieser nur im Browser geladen wird.
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface PieChartProps {
  pieSeries: number[]
  labels?: string[]
  title?: string
  description?: string
  colors?: string[]
  showLegend?: boolean
  showLabels?: boolean
  showTotal?: boolean
  donut?: boolean
}

export default function PieChart({
  pieSeries,
  labels = ["Kategorie A", "Kategorie B", "Kategorie C", "Kategorie D"],
  title = "Verteilung",
  description = "Verteilung nach Kategorie",
  colors = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#8b5cf6"],
  showLegend = true,
  showLabels = true,
  showTotal = true,
  donut = false,
}: PieChartProps) {
  const [selectedSlice, setSelectedSlice] = useState<number | null>(null)

  // Berechne die Gesamtsumme
  const total = pieSeries.reduce((sum, value) => sum + value, 0)

  // Berechne Prozentsätze für jede Kategorie
  const percentages = pieSeries.map((value) => ((value / total) * 100).toFixed(1))

  // Formatiere die Gesamtsumme
  const formatTotal = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toLocaleString("de-DE")
  }

  // Erstelle angepasste Labels mit Werten und Prozentsätzen
  const formattedLabels = labels.map((label, index) => {
    return `${label}: ${pieSeries[index].toLocaleString("de-DE")} (${percentages[index]}%)`
  })

  const chartOptions: ApexOptions = {
    chart: {
      type: donut ? "donut" : "pie",
      background: "transparent",
      fontFamily: "Inter, sans-serif",
      animations: {
        speed: 500,
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          setSelectedSlice(config.dataPointIndex === selectedSlice ? null : config.dataPointIndex)
        },
        dataPointMouseEnter: (event, chartContext, config) => {
          document.body.style.cursor = "pointer"
        },
        dataPointMouseLeave: (event, chartContext, config) => {
          document.body.style.cursor = "default"
        },
      },
    },
    labels: labels,
    colors: colors,
    legend: {
      show: showLegend,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "13px",
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
      formatter: (seriesName, opts) => {
        return showLabels ? `${seriesName}: ${percentages[opts.seriesIndex]}%` : seriesName
      },
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
    },
    dataLabels: {
      enabled: showLabels,
      formatter: (val: number, opts) => {
        return `${percentages[opts.seriesIndex]}%`
      },
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
        fontWeight: "bold",
        colors: ["#fff"],
      },
      dropShadow: {
        enabled: true,
        blur: 3,
        opacity: 0.5,
      },
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: donut
          ? {
              size: "60%",
              background: "transparent",
              labels: {
                show: showTotal,
                name: {
                  show: true,
                  fontSize: "14px",
                  fontFamily: "Inter, sans-serif",
                  color: "#64748b",
                  offsetY: -10,
                },
                value: {
                  show: true,
                  fontSize: "20px",
                  fontFamily: "Inter, sans-serif",
                  color: "#334155",
                  fontWeight: 600,
                  offsetY: 5,
                  formatter: (val) => formatTotal(total),
                },
                total: {
                  show: true,
                  showAlways: true,
                  label: "Gesamt",
                  fontSize: "14px",
                  fontFamily: "Inter, sans-serif",
                  color: "#64748b",
                  formatter: () => formatTotal(total),
                },
              },
            }
          : {},
      },
    },
    stroke: {
      width: 2,
      colors: ["#fff"],
    },
    tooltip: {
      enabled: true,
      theme: "light",
      style: {
        fontSize: "13px",
        fontFamily: "Inter, sans-serif",
      },
      y: {
        formatter: (value) => {
          return `${value.toLocaleString("de-DE")} (${((value / total) * 100).toFixed(1)}%)`
        },
      },
      marker: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 300,
          },
          legend: {
            position: "bottom",
            fontSize: "11px",
          },
        },
      },
    ],
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 0.9,
        },
      },
      active: {
        filter: {
          type: "darken",
          value: 0.4,
        },
      },
    },
  }

  return (
    <Card className="border-slate-200 shadow-md">
      <CardHeader className="bg-slate-50 border-b border-slate-200 pb-2">
        <CardTitle className="text-slate-800 text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[250px] flex items-center justify-center">
          <ReactApexChart
            options={chartOptions}
            series={pieSeries}
            type={donut ? "donut" : "pie"}
            height="100%"
            width="100%"
          />
        </div>
      </CardContent>
    </Card>
  )
}


"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ApexOptions } from "apexcharts"

// Dynamischer Import
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface AreaChartProps {
  areaSeries: {
    name: string;
    data: { x: number; y: number }[];
  }[];
  metadata?: {
    title?: string;
    description?: string;
    fullWidth?: boolean;
  };
}

export default function AreaChart({ areaSeries, metadata }: AreaChartProps) {
  const [timeframe, setTimeframe] = useState<string>("all")

  // Zeitraumfilterung
  const getFilteredData = () => {
    if (timeframe === "all") return areaSeries

    const now = Date.now()
    const cutoffDate = new Date()

    switch (timeframe) {
      case "1m":
        cutoffDate.setMonth(cutoffDate.getMonth() - 1)
        break
      case "3m":
        cutoffDate.setMonth(cutoffDate.getMonth() - 3)
        break
      case "6m":
        cutoffDate.setMonth(cutoffDate.getMonth() - 6)
        break
      case "1y":
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1)
        break
      default:
        return areaSeries
    }

    const cutoffTimestamp = cutoffDate.getTime()

    return areaSeries.map(series => ({
      name: series.name,
      data: series.data.filter(point => point.x >= cutoffTimestamp)
    }))
  }

  const filteredSeries = getFilteredData()
  
  // Farbpalette für die Bereiche
  const getGradientColors = (index: number) => {
    const palettes = [
      {
        start: "#3b82f6", // blue-500
        stop: "rgba(59, 130, 246, 0.1)",
      },
      {
        start: "#10b981", // emerald-500
        stop: "rgba(16, 185, 129, 0.1)",
      },
      {
        start: "#8b5cf6", // violet-500
        stop: "rgba(139, 92, 246, 0.1)",
      },
      {
        start: "#f59e0b", // amber-500
        stop: "rgba(245, 158, 11, 0.1)",
      },
      {
        start: "#ef4444", // red-500
        stop: "rgba(239, 68, 68, 0.1)",
      },
    ];
    
    return palettes[index % palettes.length];
  }

  // Berechne min/max für bessere Y-Achsen-Skalierung
  const allYValues = filteredSeries.flatMap(series => series.data.map(point => point.y))
  const minY = Math.min(...allYValues) * 0.95 // 5% Puffer nach unten
  const maxY = Math.max(...allYValues) * 1.05 // 5% Puffer nach oben

  // Area Chart Optionen
  const areaOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      stacked: false,
      background: "transparent",
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
      fontFamily: "Inter, sans-serif",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
    },
    colors: filteredSeries.map((_, i) => getGradientColors(i).start),
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 2,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10
      }
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
      min: minY,
      max: maxY,
      tickAmount: 5,
      labels: {
        formatter: (value) => value.toFixed(0),
        style: {
          colors: "#64748b",
          fontSize: "12px",
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontFamily: "Inter, sans-serif",
      fontSize: "13px",
      markers: {
        width: 10,
        height: 10,
        radius: 5,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
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
        formatter: (value) => value.toFixed(2),
      },
      marker: {
        show: true,
      },
      shared: true,
      intersect: false,
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const data = w.globals.initialSeries;
        const seriesName = data.map(s => s.name);
        
        const date = new Date(w.globals.seriesX[seriesIndex][dataPointIndex]);
        const formattedDate = date.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        
        let content = `
          <div class="apexcharts-tooltip-title" style="font-family: Inter, sans-serif; font-size: 14px; font-weight: 600; margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px solid #e2e8f0;">
            ${formattedDate}
          </div>
          <div style="padding: 5px 0;">
        `;
        
        // Für jede Serie einen Eintrag erstellen
        data.forEach((s, i) => {
          const color = getGradientColors(i).start;
          const value = s.data[dataPointIndex]?.y;
          if (value !== undefined) {
            content += `
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span style="color: ${color}; font-size: 12px; display: flex; align-items: center;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${color}; margin-right: 5px;"></span>
                  ${s.name}:
                </span>
                <span style="font-weight: 500; font-size: 12px;">${value.toFixed(2)}</span>
              </div>
            `;
          }
        });
        
        content += `</div>`;
        return content;
      },
    },
    markers: {
      size: 0,
      strokeWidth: 2,
      hover: {
        size: 6
      }
    },
    theme: {
      mode: "light",
    }
  };

  // Metadaten abrufen oder Standardwerte verwenden
  const title = metadata?.title || "Trendanalyse";
  const description = metadata?.description || "Entwicklung über Zeit";

  return (
    <Card className="border-slate-200 shadow-md">
      <CardHeader className="bg-slate-50 border-b border-slate-200 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-slate-800 text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
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
      <CardContent className="p-0 pt-2">
        <div className="h-[350px] w-full">
          <ReactApexChart
            options={areaOptions}
            series={filteredSeries}
            type="area"
            height="100%"
            width="100%"
          />
        </div>
      </CardContent>
    </Card>
  )
}
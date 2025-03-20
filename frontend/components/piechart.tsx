"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Doughnut } from "lucide-react"
import type { ApexOptions } from "apexcharts"

// Dynamischer Import
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface PieChartProps {
  pieSeries: {
    series: number[];
    labels: string[];
    colors?: string[];
  };
  metadata?: {
    title?: string;
    description?: string;
    fullWidth?: boolean;
    showLegend?: boolean;
    showLabels?: boolean;
    showTotal?: boolean;
    donut?: boolean;
  };
}

export default function PieChart({ pieSeries, metadata }: PieChartProps) {
  const [chartType, setChartType] = useState<string>(metadata?.donut ? "donut" : "pie")
  
  // Standardfarben, falls keine angegeben
  const colors = pieSeries.colors || [
    "#3b82f6", // blue-500 
    "#10b981", // emerald-500
    "#8b5cf6", // violet-500
    "#f59e0b", // amber-500
    "#ec4899", // pink-500
    "#ef4444", // red-500
    "#14b8a6", // teal-500
    "#6366f1", // indigo-500
    "#84cc16", // lime-500
    "#a855f7", // purple-500
  ];
  
  // Gesamtsumme berechnen
  const total = pieSeries.series.reduce((acc, val) => acc + val, 0);
  
  // Funktionen für die Anzeige
  const formatPercent = (value: number) => {
    return ((value / total) * 100).toFixed(1) + "%";
  };
  
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value.toFixed(0);
  };

  const pieOptions: ApexOptions = {
    chart: {
      type: chartType === "donut" ? "donut" : "pie",
      height: 350,
      background: "transparent",
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
    colors: colors,
    labels: pieSeries.labels,
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Inter, sans-serif",
      fontSize: "13px",
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      },
      formatter: function(seriesName, opts) {
        const percent = formatPercent(pieSeries.series[opts.seriesIndex]);
        return `${seriesName} <strong>${percent}</strong>`;
      },
      show: metadata?.showLegend !== false,
    },
    plotOptions: {
      pie: {
        dataLabels: {
          offset: -10,
        },
        donut: {
          size: '65%',
          labels: {
            show: chartType === "donut",
            name: {
              show: true,
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              color: '#334155',
            },
            value: {
              show: true,
              fontSize: '22px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              color: '#334155',
              formatter: function (val) {
                return formatValue(Number(val));
              }
            },
            total: {
              show: metadata?.showTotal !== false && chartType === "donut",
              label: 'Gesamt',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              color: '#64748b',
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return formatValue(total);
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: metadata?.showLabels !== false,
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        colors: ['#fff'],
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 3,
        color: 'rgba(0, 0, 0, 0.5)',
        opacity: 0.4
      },
      formatter: function(val, opts) {
        return formatPercent(pieSeries.series[opts.seriesIndex]);
      }
    },
    fill: {
      opacity: 1,
      type: 'solid',
    },
    stroke: {
      width: 2,
      colors: ['#fff']
    },
    tooltip: {
      enabled: true,
      theme: "light",
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
      },
      y: {
        formatter: (value) => {
          return `${formatValue(value)} (${formatPercent(value)})`;
        },
      },
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const value = pieSeries.series[seriesIndex];
        const label = pieSeries.labels[seriesIndex];
        const color = colors[seriesIndex % colors.length];
        const percent = formatPercent(value);
        
        return `
          <div class="apexcharts-tooltip-box" style="padding: 8px 10px; border-radius: 4px; background-color: #fff; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; margin-right: 8px;"></span>
              <span style="font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; color: #334155;">${label}</span>
            </div>
            <div style="margin-left: 18px; font-family: Inter, sans-serif;">
              <div style="font-size: 15px; font-weight: 700; color: #334155;">${formatValue(value)}</div>
              <div style="font-size: 12px; color: #64748b;">${percent} vom Gesamtwert</div>
            </div>
          </div>
        `;
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 300
          },
          legend: {
            position: "bottom"
          }
        }
      }
    ]
  };
  
  // Metadaten abrufen oder Standardwerte verwenden
  const title = metadata?.title || "Diagramm";
  const description = metadata?.description || "Verteilung nach Kategorien";

  return (
    <Card className="border-slate-200 shadow-md">
      <CardHeader className="bg-slate-50 border-b border-slate-200 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-slate-800 text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Tabs defaultValue={chartType} value={chartType} onValueChange={setChartType} className="w-auto">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="pie" className="text-xs px-2 py-1">
                Kreis
              </TabsTrigger>
              <TabsTrigger value="donut" className="text-xs px-2 py-1">
                Donut
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <div className="h-[350px] w-full">
          <ReactApexChart
            options={pieOptions}
            series={pieSeries.series}
            type={chartType === "donut" ? "donut" : "pie"}
            height="100%"
            width="100%"
          />
        </div>
      </CardContent>
    </Card>
  )
}
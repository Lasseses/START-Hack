"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ApexOptions } from "apexcharts"

// Dynamic import to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface BarChartProps {
  barSeries: {
    name: string;
    data: number[];
  }[];
  metadata?: {
    title?: string;
    description?: string;
    fullWidth?: boolean;
    categories?: string[];
    horizontal?: boolean;
    stacked?: boolean;
  };
}

export default function BarChart({ barSeries, metadata }: BarChartProps) {
  const [chartType, setChartType] = useState<string>(metadata?.horizontal ? "horizontal" : "vertical")
  
  // Generate categories automatically if not provided
  const categories = metadata?.categories || Array.from({ length: barSeries[0]?.data.length || 0 }, (_, i) => `Category ${i + 1}`);
  
  // Colors for bars
  const getColors = () => {
    const positive = barSeries.map((_, index) => {
      const colors = [
        "#0063A5", // Bloomberg Blue
        "#00891B", // Bloomberg Green
        "#BF2932", // Bloomberg Red
        "#7D29A0", // Bloomberg Purple
        "#E07C00", // Bloomberg Orange
      ];
      return colors[index % colors.length];
    });
    
    return positive;
  };

  // Calculate min and max for better axis scaling
  const allValues = barSeries.flatMap(series => series.data);
  const maxValue = Math.max(...allValues.map(Math.abs)) * 1.1; // 10% buffer
  const hasNegativeValues = allValues.some(value => value < 0);
  
  // Determine Y-axis limits
  const minY = hasNegativeValues ? -maxValue : 0;
  const maxY = maxValue;
  
  // Calculate number of ticks
  const tickAmount = hasNegativeValues ? 10 : 5;

  const barOptions: ApexOptions = {
    chart: {
      type: chartType === "horizontal" ? "bar" : "bar",
      height: 320,
      stacked: metadata?.stacked ?? false,
      background: "transparent",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
      fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 600,
        animateGradually: {
          enabled: true,
          delay: 100
        },
        dynamicAnimation: {
          enabled: true,
          speed: 250
        }
      },
    },
    colors: getColors(),
    plotOptions: {
      bar: {
        horizontal: chartType === "horizontal",
        columnWidth: "65%",
        borderRadius: 0,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: false,
      formatter: function (val) {
        return val.toFixed(0);
      },
      offsetY: -20,
      style: {
        fontSize: "11px",
        colors: ["#475569"]
      }
    },
    grid: {
      borderColor: "#F1F5F9",
      strokeDashArray: 1,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10
      }
    },
    xaxis: {
      type: "category",
      categories: categories,
      labels: {
        style: {
          colors: "#475569",
          fontSize: "11px",
          fontWeight: 500,
        },
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: true,
        trim: true,
        maxHeight: 120,
      },
      axisBorder: {
        show: true,
        color: "#E2E8F0",
      },
      axisTicks: {
        show: true,
        color: "#E2E8F0",
      },
    },
    yaxis: {
      min: minY,
      max: maxY,
      tickAmount: tickAmount,
      labels: {
        formatter: (value) => {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + "M";
          } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + "K";
          }
          return value.toFixed(0);
        },
        style: {
          colors: "#475569",
          fontSize: "11px",
          fontWeight: 500,
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
      fontSize: "12px",
      fontWeight: 500,
      markers: {
        width: 10,
        height: 10,
        radius: 0,
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
        fontSize: "11px",
        fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
      },
      y: {
        formatter: (value) => {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(2) + "M";
          } else if (value >= 1000) {
            return (value / 1000).toFixed(2) + "K";
          }
          return value.toFixed(2);
        },
      },
      shared: true,
      intersect: false,
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const data = w.globals.initialSeries;
        const categoryName = categories[dataPointIndex];
        
        let content = `
          <div class="apexcharts-tooltip-title" style="font-family: 'IBM Plex Sans', sans-serif; font-size: 12px; font-weight: 600; margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px solid #E2E8F0;">
            ${categoryName}
          </div>
          <div style="padding: 5px 0;">
        `;
        
        // Create entry for each series
        data.forEach((s, i) => {
          const color = getColors()[i];
          const value = s.data[dataPointIndex];
          if (value !== undefined) {
            let formattedValue = value;
            if (formattedValue >= 1000000) {
              formattedValue = (formattedValue / 1000000).toFixed(2) + "M";
            } else if (formattedValue >= 1000) {
              formattedValue = (formattedValue / 1000).toFixed(2) + "K";
            } else {
              formattedValue = formattedValue.toFixed(2);
            }
            
            content += `
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span style="color: #475569; font-size: 11px; display: flex; align-items: center;">
                  <span style="display: inline-block; width: 8px; height: 8px; background-color: ${color}; margin-right: 5px;"></span>
                  ${s.name}:
                </span>
                <span style="font-weight: 600; font-size: 11px; color: ${value >= 0 ? '#00891B' : '#BF2932'}">
                  ${value >= 0 ? '+' : ''}${formattedValue}
                </span>
              </div>
            `;
          }
        });
        
        content += `</div>`;
        return content;
      },
    },
    theme: {
      mode: "light",
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          plotOptions: {
            bar: {
              columnWidth: "90%"
            }
          },
          xaxis: {
            labels: {
              rotate: -90,
              offsetY: 0,
            }
          }
        }
      }
    ],
  };

  // Get metadata or use default values
  const title = metadata?.title || "Bar Chart";
  const description = metadata?.description || "Comparison by category";

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50 border-b border-slate-200 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-slate-800 text-base font-semibold">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
          <Tabs defaultValue={chartType} value={chartType} onValueChange={setChartType} className="w-auto">
            <TabsList className="bg-slate-100 h-7">
              <TabsTrigger value="vertical" className="text-xs px-2 h-5">
                Vertical
              </TabsTrigger>
              <TabsTrigger value="horizontal" className="text-xs px-2 h-5">
                Horizontal
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <div className="h-[320px] w-full">
          <ReactApexChart
            options={barOptions}
            series={barSeries}
            type="bar"
            height="100%"
            width="100%"
          />
        </div>
      </CardContent>
    </Card>
  )
}
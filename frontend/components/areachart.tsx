"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, ChevronRight, Info, FileBarChart } from "lucide-react"
import type { ApexOptions } from "apexcharts"

// Dynamic import to avoid SSR issues
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
    annotations?: any[];
    yAxisTitle?: string;
    showBenchmark?: boolean;
  };
}

export default function AreaChart({ areaSeries, metadata }: AreaChartProps) {
  const [timeframe, setTimeframe] = useState<string>("all")
  
  // Time frame filtering
  const getFilteredData = () => {
    if (timeframe === "all") return areaSeries

    const now = Date.now()
    const cutoffDate = new Date()

    switch (timeframe) {
      case "1w":
        cutoffDate.setDate(cutoffDate.getDate() - 7)
        break
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
      case "ytd":
        cutoffDate.setMonth(0, 1)
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
  
  // Get performance indicators for the current timeframe
  const getPerformanceData = () => {
    // Only process if we have data
    if (!filteredSeries.length || !filteredSeries[0].data.length) {
      return [];
    }
    
    return filteredSeries.map(series => {
      const data = series.data;
      const firstPoint = data[0];
      const lastPoint = data[data.length - 1];
      
      // Calculate change and change percentage
      const absoluteChange = lastPoint.y - firstPoint.y;
      const percentChange = (absoluteChange / firstPoint.y) * 100;
      
      // Find min, max
      const minValue = Math.min(...data.map(d => d.y));
      const maxValue = Math.max(...data.map(d => d.y));
      
      // Calculate volatility (simplified - standard deviation)
      const mean = data.reduce((acc, val) => acc + val.y, 0) / data.length;
      const variance = data.reduce((acc, val) => acc + Math.pow(val.y - mean, 2), 0) / data.length;
      const volatility = Math.sqrt(variance);
      
      return {
        name: series.name,
        startValue: firstPoint.y,
        endValue: lastPoint.y,
        absoluteChange,
        percentChange,
        minValue,
        maxValue,
        volatility
      };
    });
  }
  
  const performanceData = getPerformanceData();
  
  // Color palette with premium look
  const getGradientColors = (index: number) => {
    const palettes = [
      {
        name: "Blue",
        start: "#0E72CC", 
        mid: "#4E95D6",
        stop: "rgba(14, 114, 204, 0.03)",
        highlight: "#0E72CC"
      },
      {
        name: "Green",
        start: "#10803F", 
        mid: "#3AA065",
        stop: "rgba(16, 128, 63, 0.03)",
        highlight: "#10803F"
      },
      {
        name: "Red",
        start: "#C73443", 
        mid: "#D85F6C",
        stop: "rgba(199, 52, 67, 0.03)",
        highlight: "#C73443"
      },
      {
        name: "Purple",
        start: "#6930C3", 
        mid: "#9271D2",
        stop: "rgba(105, 48, 195, 0.03)",
        highlight: "#6930C3"
      },
      {
        name: "Orange",
        start: "#E26312", 
        mid: "#EC8A4E",
        stop: "rgba(226, 99, 18, 0.03)",
        highlight: "#E26312"
      },
    ];
    
    return palettes[index % palettes.length];
  }

  // Calculate min/max for better Y-axis scaling
  const allYValues = filteredSeries.flatMap(series => series.data.map(point => point.y));
  const minY = Math.min(...allYValues) * 0.95; // 5% buffer below
  const maxY = Math.max(...allYValues) * 1.05; // 5% buffer above
  
  // Create benchmark line if needed
  let benchmarkSeries = [];
  if (metadata?.showBenchmark && filteredSeries.length > 0 && filteredSeries[0].data.length > 0) {
    // Use moving average of the first series as benchmark
    const mainSeries = filteredSeries[0].data;
    const windowSize = Math.max(3, Math.floor(mainSeries.length / 15)); // Get appropriate moving average window
    
    const benchmarkData = [];
    for (let i = 0; i < mainSeries.length; i++) {
      const windowStart = Math.max(0, i - windowSize);
      const window = mainSeries.slice(windowStart, i + 1);
      const avg = window.reduce((sum, point) => sum + point.y, 0) / window.length;
      
      benchmarkData.push({
        x: mainSeries[i].x,
        y: avg
      });
    }
    
    benchmarkSeries.push({
      name: "Benchmark",
      type: "line",
      data: benchmarkData
    });
  }
  
  // Generate annotations
  const annotations = metadata?.annotations || {};
  
  // Auto-generate some annotations if none provided
  if (!metadata?.annotations && filteredSeries.length > 0 && filteredSeries[0].data.length > 5) {
    const mainSeries = filteredSeries[0].data;
    // Find local max/min points for annotations
    const localExtrema = [];
    
    for (let i = 1; i < mainSeries.length - 1; i++) {
      const prev = mainSeries[i-1].y;
      const curr = mainSeries[i].y;
      const next = mainSeries[i+1].y;
      
      if ((curr > prev && curr > next) || (curr < prev && curr < next)) {
        localExtrema.push({
          x: mainSeries[i].x,
          y: mainSeries[i].y,
          type: curr > prev ? 'max' : 'min'
        });
      }
    }
    
    // Take most significant extrema (limit to 2-3 points)
    const sortedExtrema = [...localExtrema].sort((a, b) => 
      b.type === 'max' ? b.y - a.y : a.y - b.y
    ).slice(0, 3);
    
    // Create annotations
    annotations.points = sortedExtrema.map(point => ({
      x: point.x,
      y: point.y,
      marker: {
        size: 6,
        fillColor: point.type === 'max' ? '#C73443' : '#10803F',
        strokeColor: '#fff',
        radius: 3,
      },
      label: {
        borderColor: point.type === 'max' ? '#C73443' : '#10803F',
        style: {
          color: '#fff',
          background: point.type === 'max' ? '#C73443' : '#10803F',
        },
        text: point.type === 'max' ? 'Peak' : 'Low'
      }
    }));
  }

  // Area Chart options
  const areaOptions: ApexOptions = {
    chart: {
      type: "area",
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
      fontFamily: "'Inter', 'SF Pro Display', sans-serif",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 750,
        animateGradually: {
          enabled: true,
          delay: 120
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      dropShadow: {
        enabled: true,
        top: 2,
        left: 0,
        blur: 6,
        opacity: 0.03,
        color: '#000'
      },
    },
    colors: filteredSeries.map((_, i) => getGradientColors(i).mid),
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.06,
        }
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: 'darken',
          value: 0.1,
        }
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
      lineCap: "round",
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.55,
        opacityTo: 0.05,
        stops: [0, 95, 100],
        colorStops: filteredSeries.map((_, i) => {
          const colors = getGradientColors(i);
          return [
            { offset: 0, color: colors.start, opacity: 0.5 },
            { offset: 95, color: colors.start, opacity: 0.05 },
            { offset: 100, color: colors.stop, opacity: 0 }
          ]
        })
      }
    },
    grid: {
      borderColor: "#F0F2F5",
      strokeDashArray: 3,
      position: 'back',
      padding: {
        top: 10,
        right: 10,
        bottom: 0,
        left: 15
      },
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
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
        style: {
          colors: "#64748B",
          fontSize: "11.5px",
          fontWeight: 500,
          fontFamily: "'Inter', 'SF Pro Display', sans-serif",
        },
        format: "MMM d, yyyy",
        offsetY: 1,
      },
      axisBorder: {
        show: true,
        color: "#E2E8F0",
      },
      axisTicks: {
        show: true,
        color: "#E2E8F0",
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: {
      min: minY,
      max: maxY,
      tickAmount: 5,
      forceNiceScale: true,
      labels: {
        formatter: (value) => {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + "M";
          } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + "K";
          }
          return value.toFixed(1);
        },
        style: {
          colors: "#64748B",
          fontSize: "11.5px",
          fontWeight: 500,
          fontFamily: "'Inter', 'SF Pro Display', sans-serif",
        },
        offsetX: -10,
      },
      title: {
        text: metadata?.yAxisTitle || "",
        style: {
          color: "#475569",
          fontSize: "12px",
          fontWeight: 500,
          fontFamily: "'Inter', 'SF Pro Display', sans-serif",
        },
      },
      crosshairs: {
        show: true,
        position: 'back',
        stroke: {
          color: '#E2E8F0',
          width: 1,
          dashArray: 3,
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontFamily: "'Inter', 'SF Pro Display', sans-serif",
      fontSize: "12px",
      fontWeight: 500,
      markers: {
        width: 8,
        height: 8,
        radius: 4,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      },
      offsetY: -5,
      onItemClick: {
        toggleDataSeries: true
      },
      onItemHover: {
        highlightDataSeries: true
      }
    },
    tooltip: {
      enabled: true,
      theme: "light",
      style: {
        fontSize: "11.5px",
        fontFamily: "'Inter', 'SF Pro Display', sans-serif",
      },
      x: {
        format: "MMM dd, yyyy",
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
        title: {
          formatter: (seriesName) => seriesName + ":"
        }
      },
      marker: {
        show: true,
        size: 6,
      },
      fixed: {
        enabled: false,
        position: 'topRight',
        offsetX: 0,
        offsetY: 0,
      },
      shared: true,
      intersect: false,
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const data = w.globals.initialSeries;
        const seriesName = data.map(s => s.name);
        
        const date = new Date(w.globals.seriesX[seriesIndex][dataPointIndex]);
        const formattedDate = date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        
        let content = `
          <div class="tooltip-wrapper" style="background: #FFFFFF; border-radius: 4px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); padding: 8px 10px;">
            <div class="tooltip-header" style="font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid #E2E8F0;">
              ${formattedDate}
            </div>
            <div class="tooltip-body" style="padding-top: 2px;">
        `;
        
        // Create entry for each series
        data.forEach((s, i) => {
          const colors = getGradientColors(i);
          const value = s.data[dataPointIndex]?.y;
          
          if (value !== undefined) {
            let formattedValue;
            if (value >= 1000000) {
              formattedValue = (value / 1000000).toFixed(2) + "M";
            } else if (value >= 1000) {
              formattedValue = (value / 1000).toFixed(2) + "K";
            } else {
              formattedValue = value.toFixed(2);
            }
            
            // Get change from previous point if available
            let changeText = "";
            if (dataPointIndex > 0) {
              const prevValue = s.data[dataPointIndex-1]?.y;
              if (prevValue !== undefined) {
                const change = value - prevValue;
                const pctChange = (change / prevValue) * 100;
                const changeColor = change >= 0 ? "#10803F" : "#C73443";
                
                changeText = `
                  <span style="margin-left: 6px; font-size: 10px; color: ${changeColor}; white-space: nowrap;">
                    ${change >= 0 ? "+" : ""}${pctChange.toFixed(1)}%
                  </span>
                `;
              }
            }
            
            content += `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <div style="display: flex; align-items: center;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${colors.highlight}; margin-right: 8px;"></span>
                  <span style="color: #475569; font-size: 11px; font-weight: 500;">${s.name}</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="font-weight: 600; font-size: 11px; color: #334155;">${formattedValue}</span>
                  ${changeText}
                </div>
              </div>
            `;
          }
        });
        
        content += `
            </div>
          </div>
        `;
        return content;
      },
    },
    markers: {
      size: 0,
      strokeWidth: 2,
      strokeColors: filteredSeries.map((_, i) => getGradientColors(i).start),
      fillOpacity: 1,
      hover: {
        size: 5,
        sizeOffset: 2
      }
    },
    theme: {
      mode: "light",
    },
    annotations: annotations,
    responsive: [
      {
        breakpoint: 640,
        options: {
          legend: {
            position: "bottom",
            offsetY: 0,
            offsetX: 0
          }
        }
      }
    ]
  };

  // Get metadata or use default values
  const title = metadata?.title || "Performance Analysis";

  // Format performance number with color and arrow
  const formatPerformance = (value: number) => {
    if (value > 0) {
      return (
        <span className="flex items-center text-emerald-600 font-semibold text-xs">
          <ArrowUp className="h-3 w-3 mr-0.5" />
          {value.toFixed(2)}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="flex items-center text-red-600 font-semibold text-xs">
          <ArrowDown className="h-3 w-3 mr-0.5" />
          {Math.abs(value).toFixed(2)}%
        </span>
      );
    }
    return <span className="text-slate-500 font-semibold text-xs">0.00%</span>;
  };

  return (
    <Card className="border-slate-200 shadow overflow-hidden h-[40vh] min-h-[320px] w-full flex flex-col">
      <CardHeader className="border-b border-slate-200 py-1.5 px-4 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 h-auto">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex items-center">
              <CardTitle className="text-slate-800 text-sm font-semibold">{title}</CardTitle>
              {timeframe !== "all" && performanceData.length > 0 && 
                <Badge variant="outline" className="ml-2 px-1.5 py-0 h-4 text-xs font-medium border-slate-300 text-slate-600">
                  {timeframe.toUpperCase()}
                </Badge>
              }
            </div>
           
          </div>
          <Tabs defaultValue="all" value={timeframe} onValueChange={setTimeframe} className="w-auto">
            <TabsList className="bg-slate-100 h-5 px-1">
              <TabsTrigger value="1w" className="text-xs px-1.5 h-4">
                1W
              </TabsTrigger>
              <TabsTrigger value="1m" className="text-xs px-1.5 h-4">
                1M
              </TabsTrigger>
              <TabsTrigger value="3m" className="text-xs px-1.5 h-4">
                3M
              </TabsTrigger>
              <TabsTrigger value="6m" className="text-xs px-1.5 h-4">
                6M
              </TabsTrigger>
              <TabsTrigger value="ytd" className="text-xs px-1.5 h-4">
                YTD
              </TabsTrigger>
              <TabsTrigger value="1y" className="text-xs px-1.5 h-4">
                1Y
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs px-1.5 h-4">
                MAX
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Performance indicators */}
        {performanceData.length > 0 && (
          <div className="flex flex-wrap mt-1 gap-2">
            {performanceData.slice(0, 2).map((perf, index) => (
              <div key={index} className="flex items-center bg-slate-100 rounded px-2 py-0.5">
                <span className="text-slate-500 text-xs font-medium mr-1.5">{perf.name}:</span>
                {formatPerformance(perf.percentChange)}
              </div>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0 flex-1 w-full bg-white h-[calc(100%-60px)]">
        <ReactApexChart
          options={areaOptions}
          series={[...filteredSeries, ...benchmarkSeries]}
          type="area"
          height="100%"
          width="100%"
        />
      </CardContent>
      
      {/* Optional footer with additional metrics */}
      {performanceData.length > 0 && (
        <CardFooter className="py-1.5 px-4 border-t border-slate-200 flex justify-between bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 h-auto">
          <div className="flex text-xs text-slate-500 items-center">
            <FileBarChart className="h-3.5 w-3.5 mr-1 text-slate-400" />
            <span className="font-medium mr-1">Volatility:</span>
            {(performanceData[0].volatility / performanceData[0].endValue * 100).toFixed(2)}%
          </div>
          <div className="flex items-center text-xs text-slate-600">
            <span className="font-medium text-slate-500 mr-1">Range:</span>
            {performanceData[0].minValue.toFixed(2)} - {performanceData[0].maxValue.toFixed(2)}
            <Info className="h-3 w-3 ml-1.5 text-slate-400 cursor-pointer" />
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
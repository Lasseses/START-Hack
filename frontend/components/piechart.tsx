"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PieChart as PieIcon, Info, ArrowRight, Download, ArrowUpDown, Filter } from "lucide-react"
import type { ApexOptions } from "apexcharts"

// Dynamic import to avoid SSR issues
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
    monochrome?: boolean;
    valuePrefix?: string;
    valueSuffix?: string;
    enableSelection?: boolean;
    enableGradient?: boolean;
    pattern?: boolean;
    enableAnimations?: boolean;
    legendPosition?: "top" | "bottom" | "right";
  };
}

export default function PieChart({ pieSeries, metadata }: PieChartProps) {
  const [chartType, setChartType] = useState<string>(metadata?.donut ? "donut" : "pie")
  const [selectedSlices, setSelectedSlices] = useState<number[]>([])
  const [sortType, setSortType] = useState<string>("none")
  
  // Fixed chart height based on container height minus header and optional footer
  const chartHeight = 220; // Fixed chart area height to fit within card
  
  // Sort data if needed
  const sortData = () => {
    if (sortType === "none") return pieSeries;
    
    const combined = pieSeries.series.map((value, idx) => ({
      value,
      label: pieSeries.labels[idx],
      color: pieSeries.colors ? pieSeries.colors[idx] : undefined
    }));
    
    combined.sort((a, b) => {
      if (sortType === "value") {
        return b.value - a.value; // descending by value
      } else if (sortType === "value-asc") {
        return a.value - b.value; // ascending by value
      } else if (sortType === "alpha") {
        return a.label.localeCompare(b.label); // alphabetical
      } else if (sortType === "alpha-desc") {
        return b.label.localeCompare(a.label); // reverse alphabetical
      }
      return 0;
    });
    
    return {
      series: combined.map(item => item.value),
      labels: combined.map(item => item.label),
      colors: pieSeries.colors ? combined.map(item => item.color) : undefined
    };
  };
  
  const processedSeries = sortType !== "none" ? sortData() : pieSeries;
  
  // Default colors if none provided - professional palette
  const baseColors = processedSeries.colors || [
    "#0E72CC", // Bloomberg Blue
    "#3AA065", // Green
    "#C73443", // Red
    "#6930C3", // Purple
    "#E26312", // Orange
    "#1A91EB", // Light Blue
    "#5DC983", // Light Green
    "#E05A69", // Light Red
    "#9271D2", // Light Purple
    "#F89748"  // Light Orange
  ];
  
  // Apply gradient effect if enabled
  const getColors = () => {
    if (!metadata?.enableGradient) return baseColors;
    
    // For gradients, we need to define them in the fill.gradient
    return baseColors;
  };
  
  // Calculate total sum
  const total = processedSeries.series.reduce((acc, val) => acc + val, 0);
  
  // Formatting functions
  const formatPercent = (value: number) => {
    return ((value / total) * 100).toFixed(1) + "%";
  };
  
  const formatValue = (value: number) => {
    const prefix = metadata?.valuePrefix || "";
    const suffix = metadata?.valueSuffix || "";
    
    if (value >= 1000000) {
      return prefix + (value / 1000000).toFixed(1) + "M" + suffix;
    } else if (value >= 1000) {
      return prefix + (value / 1000).toFixed(1) + "K" + suffix;
    }
    return prefix + value.toFixed(0) + suffix;
  };

  // Get top/bottom performers
  const getOutliers = () => {
    if (processedSeries.series.length < 3) return null;
    
    const sorted = [...processedSeries.series].map((value, index) => ({ 
      value, 
      label: processedSeries.labels[index],
      percent: (value / total) * 100
    })).sort((a, b) => b.value - a.value);
    
    return {
      top: sorted[0],
      bottom: sorted[sorted.length - 1],
      topThree: sorted.slice(0, 3).reduce((acc, item) => acc + item.value, 0) / total * 100
    };
  };
  
  const outliers = getOutliers();

  // Customize chart options
  const pieOptions: ApexOptions = {
    chart: {
      type: chartType === "donut" ? "donut" : "pie",
      height: chartHeight,
      background: "transparent",
      fontFamily: "'Inter', 'SF Pro Display', sans-serif",
      animations: {
        enabled: metadata?.enableAnimations !== false,
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
      dropShadow: {
        enabled: true,
        top: 2,
        left: 0,
        blur: 3,
        opacity: 0.1,
        color: '#000'
      },
      events: {
        dataPointSelection: function(event, chartContext, config) {
          if (metadata?.enableSelection) {
            const seriesIndex = config.dataPointIndex;
            setSelectedSlices(prev => {
              if (prev.includes(seriesIndex)) {
                return prev.filter(idx => idx !== seriesIndex);
              } else {
                return [...prev, seriesIndex];
              }
            });
          }
        },
        legendClick: function(chartContext, seriesIndex, config) {
          if (metadata?.enableSelection) {
            setSelectedSlices(prev => {
              if (prev.includes(seriesIndex)) {
                return prev.filter(idx => idx !== seriesIndex);
              } else {
                return [...prev, seriesIndex];
              }
            });
          }
        }
      }
    },
    colors: getColors(),
    fill: {
      type: metadata?.pattern ? "pattern" : (metadata?.enableGradient ? "gradient" : "solid"),
      gradient: metadata?.enableGradient ? {
        shade: 'dark',
        type: "horizontal",
        gradientToColors: baseColors.map(color => {
          // Lighten the color for gradient
          return color.replace(/^#/, '').match(/.{2}/g)?.map(hex => {
            const val = Math.min(255, parseInt(hex, 16) + 40);
            return val.toString(16).padStart(2, '0');
          }).join('') || color;
        }),
        shadeIntensity: 0.65,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      } : undefined,
      pattern: metadata?.pattern ? {
        style: 'squares',
        width: 6,
        height: 6,
        strokeWidth: 1
      } : undefined,
      opacity: 1,
    },
    labels: processedSeries.labels,
    legend: {
      position: metadata?.legendPosition || "bottom",
      horizontalAlign: "center",
      fontFamily: "'Inter', 'SF Pro Display', sans-serif",
      fontSize: "11px",
      fontWeight: 500,
      markers: {
        width: 8,
        height: 8,
        radius: 2,
        offsetX: 0,
        offsetY: 0,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 3
      },
      formatter: function(seriesName, opts) {
        const percent = formatPercent(processedSeries.series[opts.seriesIndex]);
        return `<div class="flex items-center">
          <span class="mr-1">${seriesName}</span>
          <span style="font-weight:600;color:#334155">${percent}</span>
        </div>`;
      },
      onItemClick: {
        toggleDataSeries: metadata?.enableSelection || false
      },
      onItemHover: {
        highlightDataSeries: true
      },
      show: metadata?.showLegend !== false,
    },
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.1,
        }
      },
      active: {
        filter: {
          type: 'darken',
          value: 0.15,
        }
      }
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        dataLabels: {
          offset: -12,
          minAngleToShowLabel: 10
        },
        donut: {
          size: chartType === "donut" ? '60%' : '0%',
          background: 'transparent',
          labels: {
            show: chartType === "donut",
            name: {
              show: true,
              fontSize: '13px',
              fontFamily: "'Inter', 'SF Pro Display', sans-serif",
              fontWeight: 600,
              color: '#334155',
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: '20px',
              fontFamily: "'Inter', 'SF Pro Display', sans-serif",
              fontWeight: 700,
              color: '#334155',
              offsetY: 5,
              formatter: function (val) {
                return formatValue(Number(val));
              }
            },
            total: {
              show: metadata?.showTotal !== false && chartType === "donut",
              label: 'Total',
              fontSize: '13px',
              fontFamily: "'Inter', 'SF Pro Display', sans-serif",
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
        fontSize: '10px',
        fontFamily: "'Inter', 'SF Pro Display', sans-serif",
        fontWeight: 600,
        colors: ['#fff'],
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 2,
        color: 'rgba(0, 0, 0, 0.5)',
        opacity: 0.45
      },
      formatter: function(val, opts) {
        return formatPercent(processedSeries.series[opts.seriesIndex]);
      },
      textAnchor: 'middle',
      distributed: true,
    },
    stroke: {
      width: chartType === "donut" ? 2 : 1,
      colors: ['#fff']
    },
    tooltip: {
      enabled: true,
      theme: "light",
      fillSeriesColor: false,
      style: {
        fontSize: "11.5px",
        fontFamily: "'Inter', 'SF Pro Display', sans-serif",
      },
      y: {
        formatter: (value) => {
          return `${formatValue(value)} (${formatPercent(value)})`;
        },
        title: {
          formatter: (seriesName) => seriesName
        }
      },
      marker: {
        show: false,
      },
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const value = processedSeries.series[seriesIndex];
        const label = processedSeries.labels[seriesIndex];
        const color = baseColors[seriesIndex % baseColors.length];
        const percent = formatPercent(value);
        const formattedValue = formatValue(value);
        
        return `
          <div class="tooltip-wrapper" style="background: #FFFFFF; border-radius: 4px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); padding: 8px 10px; min-width: 140px;">
            <div class="tooltip-header" style="display: flex; align-items: center; margin-bottom: 4px;">
              <span style="display: inline-block; width: 8px; height: 8px; background-color: ${color}; margin-right: 6px;"></span>
              <span style="font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: #334155;">${label}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0px; border-top: 1px solid #F1F5F9;">
              <span style="font-family: 'Inter', sans-serif; font-size: 11px; color: #64748B;">Value:</span>
              <span style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; color: #334155;">${formattedValue}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-family: 'Inter', sans-serif; font-size: 11px; color: #64748B;">Percentage:</span>
              <span style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; color: #334155;">${percent}</span>
            </div>
            
            ${series.length > 2 ? `
            <div style="display: flex; justify-content: space-between; margin-top: 6px; padding-top: 6px; border-top: 1px solid #F1F5F9;">
              <span style="font-family: 'Inter', sans-serif; font-size: 11px; color: #64748B;">Rank:</span>
              <span style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; color: #334155;">
                ${[...series].sort((a, b) => b - a).indexOf(value) + 1} of ${series.length}
              </span>
            </div>
            ` : ''}
          </div>
        `;
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            fontSize: "11px",
          },
          dataLabels: {
            minAngleToShowLabel: 20
          }
        }
      }
    ]
  };
  
  // Handle monochrome mode
  if (metadata?.monochrome) {
    pieOptions.plotOptions = {
      ...pieOptions.plotOptions,
      pie: {
        ...pieOptions.plotOptions?.pie,
        monochrome: {
          enabled: true,
          color: '#0E72CC', // Bloomberg blue
          shadeTo: 'light',
          shadeIntensity: 0.65
        }
      }
    };
  }
  
  // Get metadata or use default values
  const title = metadata?.title || "Distribution Analysis";
  const description = metadata?.description || "Distribution by category";

  return (
    <Card className="border-slate-200 shadow overflow-hidden h-full w-full flex flex-col">
      <CardHeader className="bg-slate-50 border-b border-slate-200 py-1.5 px-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex items-center">
              <CardTitle className="text-slate-800 text-sm font-semibold">{title}</CardTitle>
              {outliers && 
                <Badge variant="outline" className="ml-2 px-1.5 py-0 h-4 text-xs font-medium border-slate-300 text-slate-600">
                  {outliers.topThree.toFixed(0)}% in top 3
                </Badge>
              }
            </div>
            <CardDescription className="text-xs mt-0">{description}</CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Only show sorting dropdown if it makes sense */}
            {processedSeries.series.length > 2 && (
              <div className="relative inline-block">
                <select
                  className="appearance-none bg-slate-100 text-xs py-0.5 pl-2 pr-6 rounded h-5 border-0 focus:outline-none focus:ring-1 focus:ring-slate-300 text-slate-700"
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value)}
                >
                  <option value="none">Default</option>
                  <option value="value">Value ↓</option>
                  <option value="value-asc">Value ↑</option>
                  <option value="alpha">A-Z</option>
                  <option value="alpha-desc">Z-A</option>
                </select>
                <ArrowUpDown className="absolute right-1.5 top-1 h-3 w-3 pointer-events-none text-slate-500" />
              </div>
            )}
            
            <Tabs defaultValue={chartType} value={chartType} onValueChange={setChartType} className="w-auto">
              <TabsList className="bg-slate-100 h-5 px-1">
                <TabsTrigger value="pie" className="text-xs px-2 h-4">
                  Pie
                </TabsTrigger>
                <TabsTrigger value="donut" className="text-xs px-2 h-4">
                  Donut
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 w-full">
        <ReactApexChart
          options={pieOptions}
          series={processedSeries.series}
          type={chartType === "donut" ? "donut" : "pie"}
          height="100%"
          width="100%"
        />
      </CardContent>
      
      {/* Optional footer with additional metrics */}
      {outliers && (
        <CardFooter className="py-1.5 px-4 border-t border-slate-200 bg-slate-50 flex justify-between">
          <div className="flex text-xs text-slate-600 items-center">
            <span className="font-medium text-slate-500 mr-1.5">Highest:</span>
            <span className="text-slate-800 font-semibold">{outliers.top.label}</span>
            <Badge className="ml-1.5 bg-blue-500 text-[9px] h-4">{outliers.top.percent.toFixed(1)}%</Badge>
          </div>
          <div className="flex text-xs text-slate-600 items-center">
            <span className="font-medium text-slate-500 mr-1.5">Lowest:</span>
            <span className="text-slate-800 font-semibold">{outliers.bottom.label}</span>
            <Badge className="ml-1.5 bg-slate-500 text-[9px] h-4">{outliers.bottom.percent.toFixed(1)}%</Badge>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
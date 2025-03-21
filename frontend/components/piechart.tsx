import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';

// Dynamic import to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Flexible PieChart component that accepts different data formats
export default function FlexiblePieChart(props) {
  // Process different input formats
  const processData = () => {
    // Format 1: Raw data array with asset/allocation or name/value properties
    if (Array.isArray(props.data)) {
      const labels = [];
      const series = [];
      
      props.data.forEach(item => {
        // Support different property naming conventions
        const label = item.asset || item.name || item.label || item.category || '';
        const value = item.allocation || item.value || item.count || item.size || 0;
        
        labels.push(label);
        series.push(value);
      });
      
      return { series, labels };
    }
    // Format 2: Already formatted pieSeries object
    else if (props.pieSeries) {
      return props.pieSeries;
    }
    // Format 3: Direct series and labels arrays
    else if (Array.isArray(props.series) && Array.isArray(props.labels)) {
      return {
        series: props.series,
        labels: props.labels,
        colors: props.colors
      };
    }
    
    // Default empty data
    return { series: [], labels: [] };
  };
  
  // Process metadata from different sources
  const getMetadata = () => {
    if (props.metadata) {
      return props.metadata;
    }
    
    return {
      title: props.title || "Data Distribution",
      description: props.description || "",
      donut: props.donut !== undefined ? props.donut : true,
      showLegend: props.showLegend !== undefined ? props.showLegend : true,
      showLabels: props.showLabels !== undefined ? props.showLabels : true,
      showTotal: props.showTotal !== undefined ? props.showTotal : true,
      enableGradient: props.enableGradient !== undefined ? props.enableGradient : false
    };
  };
  
  // Process data and metadata
  const pieSeries = processData();
  const metadata = getMetadata();
  
  // Base colors if none provided
  const baseColors = [
    "#4F87C5", // Blue
    "#6EAF89", // Green
    "#CC6B73", // Red
    "#8E74BB", // Purple
    "#E19052", // Orange
    "#71A8D7", // Light Blue
    "#88C7A0", // Light Green
    "#D6868E", // Light Red
    "#A487CA", // Light Purple
    "#EEA877"  // Light Orange
  ];
  
  // Use provided colors or default
  const chartColors = pieSeries.colors || props.colors || baseColors;
  
  const [chartType, setChartType] = useState(metadata.donut ? "donut" : "pie");
  const [sortType, setSortType] = useState("none");
  
  // Calculate total
  const total = pieSeries.series.reduce((acc, val) => acc + val, 0);
  
  // Formatting functions
  const formatPercent = (value) => {
    return ((value / total) * 100).toFixed(1) + "%";
  };
  
  const formatValue = (value) => {
    const prefix = metadata.valuePrefix || "";
    const suffix = metadata.valueSuffix || "";
    
    // If the total is 100, assume we're working with percentages
    if (total === 100) {
      return prefix + value.toFixed(1) + "%" + suffix;
    }
    
    // Otherwise, format based on the magnitude
    if (value >= 1000000) {
      return prefix + (value / 1000000).toFixed(1) + "M" + suffix;
    } else if (value >= 1000) {
      return prefix + (value / 1000).toFixed(1) + "K" + suffix;
    }
    return prefix + value.toFixed(0) + suffix;
  };
  
  // Get outliers (highest, lowest, etc.)
  const getOutliers = () => {
    if (pieSeries.series.length < 3) return null;
    
    const sorted = [...pieSeries.series].map((value, index) => ({ 
      value, 
      label: pieSeries.labels[index],
      percent: (value / total) * 100
    })).sort((a, b) => b.value - a.value);
    
    return {
      top: sorted[0],
      bottom: sorted[sorted.length - 1],
      topThree: sorted.slice(0, 3).reduce((acc, item) => acc + item.value, 0) / total * 100
    };
  };
  
  const outliers = getOutliers();
  
  // Chart options
  const chartOptions = {
    chart: {
      type: chartType,
      background: "transparent",
      fontFamily: "'Inter', 'SF Pro Display', sans-serif",
      animations: {
        enabled: metadata.enableAnimations !== false,
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
      }
    },
    colors: chartColors,
    fill: {
      type: "solid",
      gradient: undefined,
      pattern: undefined,
      opacity: 1,
    },
    labels: pieSeries.labels,
    legend: {
      position: metadata.legendPosition || "right",
      horizontalAlign: "center",
      fontFamily: "'Inter', 'SF Pro Display', sans-serif",
      fontSize: "11px",
      fontWeight: 500,
      markers: {
        width: 8,
        height: 8,
        radius: 2
      },
      itemMargin: {
        horizontal: 8,
        vertical: 3
      },
      formatter: function(seriesName, opts) {
        const percent = formatPercent(pieSeries.series[opts.seriesIndex]);
        return `<div class="flex items-center">
          <span class="mr-1">${seriesName}</span>
          <span style="font-weight:600;color:#334155">${percent}</span>
        </div>`;
      },
      onItemHover: {
        highlightDataSeries: true
      },
      show: metadata.showLegend !== false
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
              show: metadata.showTotal !== false && chartType === "donut",
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
      enabled: metadata.showLabels !== false,
      style: {
        fontSize: '10px',
        fontFamily: "'Inter', 'SF Pro Display', sans-serif",
        fontWeight: 600,
        colors: ['#fff']
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
        return formatPercent(pieSeries.series[opts.seriesIndex]);
      }
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
        }
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            fontSize: "11px"
          },
          dataLabels: {
            minAngleToShowLabel: 20
          }
        }
      }
    ]
  };
  
  // Handle monochrome mode
  if (metadata.monochrome) {
    chartOptions.plotOptions = {
      ...chartOptions.plotOptions,
      pie: {
        ...chartOptions.plotOptions.pie,
        monochrome: {
          enabled: true,
          color: '#0E72CC',
          shadeTo: 'light',
          shadeIntensity: 0.65
        }
      }
    };
  }

  // Sort data if needed
  useEffect(() => {
    if (sortType === "none") return;
    
    const combined = pieSeries.series.map((value, idx) => ({
      value,
      label: pieSeries.labels[idx]
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
    
    pieSeries.series = combined.map(item => item.value);
    pieSeries.labels = combined.map(item => item.label);
  }, [sortType]);

  return (
    <Card className="border-slate-200 shadow overflow-hidden h-[40vh] min-h-[320px] border-0 shadow-md relative w-full flex flex-col">
      <CardHeader className="bg-slate-50 border-b border-slate-200 py-1.5 px-4 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex items-center">
              <CardTitle className="text-slate-800 text-sm font-semibold">{metadata.title}</CardTitle>
              {outliers && 
                <Badge variant="outline" className="ml-2 px-1.5 py-0 h-4 text-xs font-medium border-slate-300 text-slate-600">
                  {outliers.topThree.toFixed(0)}% in top 3
                </Badge>
              }
            </div>
            <CardDescription className="text-xs mt-0">{metadata.description}</CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Only show sorting dropdown if it makes sense */}
            {pieSeries.series.length > 2 && (
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
      
      <CardContent className="p-0 flex-1 w-full h-[calc(100%-60px)] bg-white/80">
        <ReactApexChart
          options={chartOptions}
          series={pieSeries.series}
          type={chartType}
          height="100%"
          width="100%"
        />
      </CardContent>
      
      {outliers && (
        <CardFooter className="py-1.5 px-4 border-t border-slate-200 bg-slate-50 flex justify-between bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 h-auto">
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
  );
}
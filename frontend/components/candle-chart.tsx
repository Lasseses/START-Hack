import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Sample stock data
const sampleData = [
  {
    x: new Date("2024-01-02").getTime(),
    y: [149.3, 150.4, 147.8, 148.56], // [open, high, low, close]
  },
  {
    x: new Date("2024-01-03").getTime(),
    y: [148.4, 150.2, 148.1, 149.8],
  },
  {
    x: new Date("2024-01-04").getTime(),
    y: [149.9, 150.1, 147.2, 147.6],
  },
  {
    x: new Date("2024-01-05").getTime(),
    y: [147.8, 152.5, 147.5, 152.3],
  },
  {
    x: new Date("2024-01-08").getTime(),
    y: [152.5, 153.6, 150.8, 151.4],
  },
  {
    x: new Date("2024-01-09").getTime(),
    y: [151.2, 154.2, 150.9, 153.7],
  },
  {
    x: new Date("2024-01-10").getTime(),
    y: [153.6, 153.8, 149.6, 150.2],
  },
];

// Sample volume data
const volumeData = [
  {
    x: new Date("2024-01-02").getTime(),
    y: 80777550,
  },
  {
    x: new Date("2024-01-03").getTime(),
    y: 75456000,
  },
  {
    x: new Date("2024-01-04").getTime(),
    y: 68234000,
  },
  {
    x: new Date("2024-01-05").getTime(),
    y: 92345600,
  },
  {
    x: new Date("2024-01-08").getTime(),
    y: 65432100,
  },
  {
    x: new Date("2024-01-09").getTime(),
    y: 78901200,
  },
  {
    x: new Date("2024-01-10").getTime(),
    y: 84567800,
  },
];

const CandlestickChart = ({
  candleData = sampleData,
  volumes = volumeData,
  height,
  title = "Stock Price",
  className = "",
}) => {
  // Client-side rendering check
  const [isMounted, setIsMounted] = useState(false);
  const [chartHeight, setChartHeight] = useState(350);
  const [containerRef, setContainerRef] = useState(null);

  useEffect(() => {
    setIsMounted(true);

    // Dynamically calculate chart heights based on container
    if (containerRef) {
      const containerHeight = containerRef.clientHeight;
      // Allocate 75% of space to candlestick and 25% to volume
      setChartHeight(Math.floor(containerHeight * 0.75));
    }
  }, [containerRef]);

  // Set ref callback to get container dimensions
  const setRef = (ref) => {
    if (ref !== null) {
      setContainerRef(ref);
    }
  };

  // Candlestick chart options
  const options = {
    chart: {
      type: "candlestick",
      height: height || chartHeight,
      id: "candles",
      toolbar: {
        autoSelected: "pan",
        show: true,
      },
      zoom: {
        enabled: true,
      },
      background: "#27272a",
    },
    title: {
      text: title,
      align: "left",
      style: {
        color: "#e5e7eb",
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#22c55e",
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
        style: {
          colors: "#9ca3af",
        },
      },
      axisBorder: {
        show: true,
        color: "#4b5563",
      },
      axisTicks: {
        show: true,
        color: "#4b5563",
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#9ca3af",
        },
        formatter: (val) => val.toFixed(2),
      },
      tooltip: {
        enabled: true,
      },
    },
    grid: {
      borderColor: "#374151",
      strokeDashArray: 3,
    },
    tooltip: {
      theme: "dark",
    },
    theme: {
      mode: "dark",
      palette: "palette1",
    },
  };

  // Volume chart options
  const volumeOptions = {
    chart: {
      height: containerRef ? Math.floor(containerRef.clientHeight * 0.25) : 160,
      type: "bar",
      brush: {
        enabled: true,
        target: "candles",
      },
      selection: {
        enabled: true,
        xaxis: {
          min: candleData[0]?.x,
          max: candleData[candleData.length - 1]?.x,
        },
        fill: {
          color: "#4b5563",
          opacity: 0.4,
        },
        stroke: {
          color: "#6b7280",
        },
      },
      background: "#27272a",
    },
    plotOptions: {
      bar: {
        columnWidth: "80%",
        colors: {
          ranges: [
            {
              from: -1000,
              to: 0,
              color: "#ef4444",
            },
            {
              from: 1,
              to: 10000000000,
              color: "#22c55e",
            },
          ],
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
    },
    xaxis: {
      type: "datetime",
      axisBorder: {
        show: true,
        color: "#4b5563",
      },
      labels: {
        style: {
          colors: "#9ca3af",
        },
      },
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          colors: "#9ca3af",
        },
        formatter: (val) => {
          if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
          if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
          return val;
        },
      },
    },
    grid: {
      borderColor: "#374151",
      strokeDashArray: 3,
    },
    tooltip: {
      theme: "dark",
    },
    title: {
      text: "Volume",
      align: "left",
      style: {
        color: "#e5e7eb",
      },
    },
  };

  const candleSeries = [
    {
      name: "Price",
      data: candleData,
    },
  ];

  const volumeSeries = [
    {
      name: "Volume",
      data: volumes,
    },
  ];

  if (!isMounted) {
    return (
      <div
        className={`w-full h-full bg-zinc-900 p-4 rounded-lg flex items-center justify-center text-gray-400 ${className}`}
      >
        Loading chart...
      </div>
    );
  }

  return (
    <div
      ref={setRef}
      className={`w-full h-full  bg-zinc-900 p-4 rounded-lg ${className}`}
    >
      <div className="flex-grow">
        <Chart
          options={options}
          series={candleSeries}
          type="candlestick"
          height={height || chartHeight}
        />
      </div>
      <div>
        <Chart
          options={volumeOptions}
          series={volumeSeries}
          type="bar"
          height={
            containerRef ? Math.floor(containerRef.clientHeight * 0.25) : 160
          }
        />
      </div>
    </div>
  );
};

export default CandlestickChart;

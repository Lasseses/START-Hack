import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApexOptions } from "apexcharts";

// Dynamischer Import, um SSR-Probleme zu vermeiden
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const barOptions = {
    chart: {
      type: "bar",
      background: "transparent",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    },
    yaxis: {
      title: {
        text: "Value",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => "$ " + val,
      },
    },
    theme: {
      palette: "palette1",
    },
  };

interface BarChartProps {
  barSeries: {
    name: string;
    data: number[];
  }[];
}

export default function BarChart({ barSeries }: BarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart</CardTitle>
        <CardDescription>Monthly performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-40">
          <ReactApexChart
            options={barOptions}
            series={barSeries}
            type="bar"
            height="100%"
          />
        </div>
      </CardContent>
    </Card>
  );
}

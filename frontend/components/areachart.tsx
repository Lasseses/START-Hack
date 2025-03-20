import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApexOptions } from "apexcharts";

// Dynamischer Import, um den Chart nur im Browser zu laden
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AreaChartProps {
  areaSeries: {
    name: string;
    data: number[];
  }[];
}

const areaOptions: ApexOptions = {
  chart: {
    type: "area",
    height: 350,
    stacked: false,
    background: "transparent",
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
  },
  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  },
  tooltip: {
    x: {
      format: "dd/MM/yy HH:mm",
    },
  },
  theme: {
    palette: "palette1",
  },
};

export default function AreaChart({ areaSeries }: AreaChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Area Chart</CardTitle>
        <CardDescription>Trend analysis over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-40">
          <ReactApexChart options={areaOptions} series={areaSeries} type="area" height="100%" />
        </div>
      </CardContent>
    </Card>
  );
}

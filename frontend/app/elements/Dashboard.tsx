// components/elements/Dashboard.tsx
"use client";
import { useDashboard } from "@/context/DashboardContext";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tile, CandlestickData, PieData, BarData, AreaData, TableData } from "@/types/dashboard";
import Lottie from "lottie-react";
// Import your lottie animation file
// Adjust the path to match where your .lottie file is stored
import animationData from "@/public/animations/main_page.json";

// Typisiere die Props für jede Komponente
interface CandleStickChartProps {
  candlestickData: CandlestickData[];
  metadata?: any;
}

interface AreaChartProps {
  areaSeries: AreaData[];
  metadata?: any;
}

interface PieChartProps {
  pieSeries: PieData;
  metadata?: {
    title?: string;
    description?: string;
    showLegend?: boolean;
    showLabels?: boolean;
    showTotal?: boolean;
    donut?: boolean;
  };
}

interface BarChartProps {
  barSeries: {
    name: string;
    data: number[];
  }[];
}

interface DataTableProps {
  tableData: TableData[];
  metadata?: any;
}

// Dynamischer Import der Komponenten
const CandleStickChart = dynamic<CandleStickChartProps>(() => import("@/components/candlestick"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[300px] rounded-lg" />,
});
const AreaChart = dynamic<AreaChartProps>(() => import("@/components/areachart"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[300px] rounded-lg" />,
});
const PieChart = dynamic<PieChartProps>(() => import("@/components/piechart"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[300px] rounded-lg" />,
});
const BarChart = dynamic<BarChartProps>(() => import("@/components/barchart"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[300px] rounded-lg" />,
});
const DataTable = dynamic<DataTableProps>(() => import("@/components/datatable"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[300px] rounded-lg" />,
});

// Komponente zur Auswahl des richtigen Tile-Typs
const TileRenderer: React.FC<{ tile: Tile }> = ({ tile }) => {
  switch (tile.type) {
    case "candlestick":
      return <CandleStickChart candlestickData={tile.data} metadata={tile.metadata} />;
    case "pie":
      return <PieChart pieSeries={tile.data} metadata={tile.metadata} />;
    case "bar":
      return <BarChart barSeries={tile.data} metadata={tile.metadata} />;
    case "area":
      return <AreaChart areaSeries={tile.data} metadata={tile.metadata} />;
    case "table":
      return <DataTable tableData={tile.data} metadata={tile.metadata} />;
    default:
      return (
        <div className="bg-zinc-800 p-4 rounded-lg">
          <p>Unbekannter Tile-Typ: {tile.type}</p>
        </div>
      );
  }
};

export default function Dashboard() {
  const { tiles, isLoading, error } = useDashboard();

  if (error) {
    return (
      <div className="min-w-[80vw] p-4 max-h-[85vh] overflow-y-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full mt-20 mx-auto p-4 h-full overflow-y-auto">
      {isLoading ? (
        // Lade-Zustand
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="w-full h-[300px] rounded-lg" />
          <Skeleton className="w-full h-[300px] rounded-lg" />
          <Skeleton className="w-full h-[300px] rounded-lg" />
          <Skeleton className="w-full h-[300px] rounded-lg" />
        </div>
      ) : tiles.length > 0 ? (
        // Dynamisches Grid-Layout basierend auf den Tile-Größen
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tiles.map((tile, index) => (
            <div
              key={index}
              className={`${
                tile.metadata?.fullWidth
                  ? "col-span-full"
                  : tile.type === "table"
                  ? "col-span-2"
                  : ""
              }`}
            >
              <TileRenderer tile={tile} />
            </div>
          ))}
        </div>
      ) : (
        // Anfangszustand oder leeres Dashboard
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mt-10 mb-2">Welcome to your AssetIQ Dashboard</h2>
          <p className="text-zinc-400 mb-8">Create and modify your dashboard by describing your needs via the form below.</p>

          {/* Lottie Animation */}
          <div className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] mx-auto">
            <Lottie 
              animationData={animationData} 
              loop={true} 
              autoplay={true}
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

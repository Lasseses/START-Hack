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

// Interface definitions for component props
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
  metadata?: any;
}

interface BarChartProps {
  barSeries: BarData[];
  metadata?: any;
}

interface DataTableProps {
  tableData: TableData[];
  metadata?: any;
}

// Dynamic component imports
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

// Component to render the appropriate tile based on type
const TileRenderer: React.FC<{ tile: Tile }> = ({ tile }) => {
  const renderTile = () => {
    switch (tile.type) {
      case "CANDLE":
        return <CandleStickChart candlestickData={tile.data} metadata={tile.metadata} />;
      case "AREA":
        return <AreaChart areaSeries={tile.data} metadata={tile.metadata} />;
      case "PIE":
        return <PieChart pieSeries={tile.data} metadata={tile.metadata} />;
      case "BAR":
        return <BarChart barSeries={tile.data} metadata={tile.metadata} />;
      case "TABLE":
        return <DataTable tableData={tile.data} metadata={tile.metadata} />;
      default:
        return (
          <div className="bg-zinc-800 p-2 rounded-lg">
            <p>Unknown tile type: {tile.type}</p>
          </div>
        );
    }
  };

  return (
   
      <div className="p-4">{renderTile()}</div>

  );
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
        // Loading state
        <div className="grid grid-cols-1 md:grid-cols-2 ">
          <Skeleton className="w-full h-[300px] rounded-lg" />
          <Skeleton className="w-full h-[300px] rounded-lg" />
          <Skeleton className="w-full h-[300px] rounded-lg" />
          <Skeleton className="w-full h-[300px] rounded-lg" />
        </div>
      ) : tiles.length > 0 ? (
        // Dynamic grid layout based on tile sizes
        <div className="grid grid-cols-1 md:grid-cols-2">
          {tiles.map((tile, index) => (
            <div
              key={index}
              className={`${
                tile.metadata?.fullWidth
                  ? "col-span-full"
                  : tile.type === "TABLE"
                  ? "col-span-full"
                  : ""
              }`}
            >
              <TileRenderer tile={tile} />
            </div>
          ))}
        </div>
      ) : (
        // Initial state or empty dashboard
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mt-10 mb-2">Welcome to your AssetIQ Dashboard</h2>
          <p className="text-zinc-400 mb-8">Create and modify your dashboard by describing your needs via the form below.</p>

          {/* Lottie Animation */}
          <div className="w-[350px] h-[350px] mx-auto">
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
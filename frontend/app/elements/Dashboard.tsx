"use client";

import React from "react";
import TileFactory from "@/components/tile-factory";
import CandleChart from "@/components/candle-chart";

// Sample data for the Sankey chart
const customData = {
  nodes: [{ name: "Custom-Visit" }, { name: "Custom-Click" }],
  links: [{ source: 0, target: 1, value: 12345 }],
};

// Fallback data for the Candle chart (could also be passed as data)
const lineChartFallback = [
  {
    name: "2024-01-02",
    open: 49.27,
    close: 48.17,
    high: 49.3,
    low: 47.6,
    volume: 80777550,
  },
  {
    name: "2024-01-03",
    open: 48.1,
    close: 48.5,
    high: 49.0,
    low: 48.0,
    volume: 80000000,
  },
];

export default function Dashboard() {
  return (
<div className="grid grid-cols-6 grid-rows-3 gap-4 px-4" style={{ gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', maxHeight: '85vh' }}>
      <div>
        <TileFactory
          title="Mein Sankey-Diagramm"
          fallbackData={null}
          data={customData}
        >
            <CandleChart className="border border-zinc-800 rounded-sm" />
        </TileFactory>
      </div>
      
      <div className="col-span-3 row-span-2 ">
        <CandleChart className="border border-zinc-800 rounded-sm" />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface LineChartProps {
  /** Array mit den Datenpunkten; falls nicht vorhanden, werden Beispiel-Daten generiert */
  data?: any[];
  /** Der Key, der auf der x-Achse verwendet werden soll (Standard: "name") */
  xKey?: string;
  /**
   * Konfiguration der anzuzeigenden Linien.
   * Jede Linie wird durch ein Objekt mit den Eigenschaften:
   * - dataKey: Pflichtfeld, welches den Schlüssel der Daten angibt.
   * - stroke: Optionale Farbe der Linie (Standard: "#8884d8").
   * - strokeWidth: Optionale Liniendicke (Standard: 2).
   * - dot: Option, ob Punkte angezeigt werden (Standard: true).
   * - name: Optionaler Name, der in der Legende angezeigt wird.
   */
  lines?: {
    dataKey: string;
    stroke?: string;
    strokeWidth?: number;
    dot?: boolean;
    name?: string;
  }[];
  /** Margin für den Chart (Standard: { top: 10, right: 30, bottom: 10, left: 0 }) */
  margin?: { top: number; right: number; bottom: number; left: number };
  /** Optionale Formatter-Funktion für das Tooltip */
  tooltipFormatter?: (value: any, name: string, props: any) => any;
}

export default function LineChartGeneric ({
  data: initialData,
  xKey = "name",
  lines = [
    { dataKey: "close", stroke: "#8884d8", strokeWidth: 2, dot: true, name: "Close" },
  ],
  margin = { top: 10, right: 30, bottom: 10, left: 0 },
  tooltipFormatter,
}: LineChartProps) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!initialData) {
      // Beispiel-Daten generieren, falls keine Daten übergeben werden.
      // Hier wird eine Zufallsserie für 365 Tage erzeugt.
      const generated = [];
      let value = 50;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - 365 + i);
        // Leichte Zufallsschwankung
        const change = Math.random() * 2 - 1;
        value = Math.max(0, value + change);
        generated.push({
          [xKey]: date.toISOString().split("T")[0],
          close: parseFloat(value.toFixed(2)),
          high: parseFloat((value + Math.random()).toFixed(2)),
          low: parseFloat((value - Math.random()).toFixed(2)),
          open: parseFloat((value + (Math.random() * 0.5)).toFixed(2)),
          volume: Math.floor(Math.random() * 1000000),
        });
      }
      setData(generated);
    } else {
      setData(initialData);
    }
  }, [initialData, xKey]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={margin}>
          <XAxis
            dataKey={xKey}
            tick={{ fill: "#9ca3af" }}
            tickLine={{ stroke: "#4b5563" }}
            axisLine={{ stroke: "#4b5563" }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", { month: "short" });
            }}
          />
          <YAxis
            tick={{ fill: "#9ca3af" }}
            tickLine={{ stroke: "#4b5563" }}
            axisLine={{ stroke: "#4b5563" }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              borderColor: "#3f3f46",
              color: "#e4e4e7",
            }}
            formatter={tooltipFormatter}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
            }}
          />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke || "#8884d8"}
              strokeWidth={line.strokeWidth || 2}
              dot={line.dot !== undefined ? line.dot : true}
              name={line.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

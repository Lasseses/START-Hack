// types/dashboard.ts
export type TileType = 'candlestick' | 'pie' | 'bar' | 'area' | 'table';

export interface TileMetadata {
  title?: string;
  description?: string;
  fullWidth?: boolean;
}

export interface Tile {
  type: TileType;
  data: any; // Der genaue Typ kann basierend auf dem Tile-Typ weiter spezifiziert werden
  metadata?: TileMetadata;
}

export interface DashboardResponse {
  tiles: Tile[];
}

// Spezifische Typen für jedes Chart
export interface CandlestickData {
  x: number; // Timestamp
  y: [number, number, number, number]; // [open, high, low, close]
  volume?: number;
}

interface PieData {
  series: number[];
  labels: string[];
}

export interface BarData {
  name: string;
  data: number[];
}

export interface AreaData {
  name: string;
  data: number[];
}

export interface TableData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
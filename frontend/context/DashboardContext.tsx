// context/DashboardContext.tsx
"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";
import { Tile } from "@/types/dashboard";

interface DashboardContextType {
  tiles: Tile[];
  isLoading: boolean;
  error: string | null;
  fetchTiles: (query: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTiles = async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setTiles(data.tiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardContext.Provider value={{ tiles, isLoading, error, fetchTiles }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
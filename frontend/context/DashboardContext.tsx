// context/DashboardContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { Tile } from "@/types/dashboard";
import { mapApiResponseToTiles } from "@/utils/dashboardMapper";

interface DashboardContextType {
  tiles: Tile[];
  isLoading: boolean;
  error: string | null;
  fetchDashboard: (query: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType>({
  tiles: [],
  isLoading: false,
  error: null,
  fetchDashboard: async () => {},
});

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Map the API response to the dashboard tiles format
      const mappedTiles = mapApiResponseToTiles(data);
      setTiles(mappedTiles);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data");
      setTiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardContext.Provider value={{ tiles, isLoading, error, fetchDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
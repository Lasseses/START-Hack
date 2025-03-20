// components/elements/UserInput.tsx
"use client";
import { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Input } from "@/components/ui/input";
import { ArrowUp } from "lucide-react";

export default function UserInput() {
  const [query, setQuery] = useState<string>("");
  const { fetchTiles, isLoading } = useDashboard();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetchTiles(query);
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-zinc-700 border-t border-zinc-800">
      <div className="flex-grow max-w-5xl relative">
        <Input 
          className="bg-zinc-400 text-zinc-900"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Stellen Sie eine Frage zu Ihren Daten..."
          disabled={isLoading}
        />
        <ArrowUp 
          className={`absolute right-2 top-1.5 border text-zinc-800 rounded-lg ${isLoading ? 'bg-zinc-500' : 'bg-orange-400'} p-1 ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={handleSubmit}
          // Optional: Animation für Ladevorgang
          style={{ 
            animation: isLoading ? 'spin 1s linear infinite' : 'none'
          }}
        />
      </div>
    </div>
  );
}
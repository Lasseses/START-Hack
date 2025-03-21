"use client"
import { useState } from "react"
import type React from "react"

import { useDashboard } from "@/context/DashboardContext"
import { Input } from "@/components/ui/input"
import { ArrowUp} from "lucide-react"

export default function UserInput() {
  const [query, setQuery] = useState<string>("");
  const { fetchTiles, isLoading } = useDashboard();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      fetchTiles(query);
      setQuery("");
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 py-4 px-4 md:px-8 bg-[#157bdd]/10 backdrop-blur-sm border-t border-[#157bdd]/20 z-10">
      <div className="max-w-5xl mx-auto relative">
        <Input
          className="bg-white/70 backdrop-blur-sm border-[#157bdd]/30 focus:border-[#157bdd] focus:ring-2 focus:ring-[#157bdd]/20 text-gray-800 pl-4 pr-12 py-3 rounded-full shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your data..."
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full p-2 ${
            isLoading ? "bg-[#157bdd]/20" : 'bg-[#157bdd]/90'
          } text-white hover:bg-[#157bdd] transition-all duration-200 flex items-center justify-center`}
          aria-label="Submit question"
        >
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <ArrowUp className="h-5 w-5" />
          )}
        </button>
      </div>

    </div>
  )
}


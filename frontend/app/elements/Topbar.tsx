"use client";

import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GitBranch } from "lucide-react"

export default function Topbar() {
  const handleRefresh = () => {
    // Use window.location for a full page refresh
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 border-b border-slate-200/30 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 backdrop-blur-sm px-4 py-3.5 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 
            onClick={handleRefresh}
            className="text-xl font-bold text-white-800 px-3 py-1 rounded-md hover:bg-white/10 transition-all cursor-pointer select-none"
          >
            AssetIQ Dashboard
          </h1>
          <nav className="hidden md:flex">
            <ul className="flex space-x-2">
              <li className="text-sm text-white-600 hover:text-[#ffffff] px-3 py-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer select-none">REGN</li>
              <li className="text-sm text-white-600 hover:text-[#ffffff] px-3 py-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer select-none">CELG</li>
              <li className="text-sm text-white-600 hover:text-[#ffffff] px-3 py-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer select-none">GILD</li>
              <li className="text-sm text-white-600 hover:text-[#ffffff] px-3 py-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer select-none">Future</li>
              <li className="text-sm text-white-600 hover:text-[#ffffff] px-3 py-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer select-none">Worldwide Bond Overview</li>
              <li className="text-sm text-white-600 hover:text-[#ffffff] px-3 py-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer select-none">World Markets</li>
              <li className="text-sm text-white-600 hover:text-[#ffffff] px-3 py-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer select-none">MKT Global</li>
            </ul>
          </nav>
        </div>
        
        {/* Icons container */}
        <div className="flex items-center space-x-3">
          {/* GitHub branch icon */}
          <div className="p-2 rounded-md hover:bg-white/10 transition-all cursor-pointer">
            <GitBranch className="h-5 w-5 text-white" />
          </div>
          
          {/* User icon */}
          <div className="p-2 rounded-md hover:bg-white/10 transition-all cursor-pointer">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}

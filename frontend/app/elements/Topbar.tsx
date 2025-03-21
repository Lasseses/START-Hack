"use client";

import { Share, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GitBranch } from "lucide-react";
import Image from "next/image";

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
        <div className="flex items-center space-x-2">
          <div className="flex items-center cursor-pointer" onClick={handleRefresh}>
            <Image
              src="/images/logo.svg"
              alt="AssetIQ Logo"
              width={32}
              height={32}
              className="rounded-sm"
            />
          </div>
          <h1 
            onClick={handleRefresh}
            className="text-xl font-bold text-white-800 px-3 py-1 rounded-md hover:bg-white/10 transition-all cursor-pointer select-none"
          >
            AssetIQ | Dashboard
          </h1>
        </div>
        
        {/* Icons container */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-md hover:bg-white/10 transition-all cursor-pointer">
            <Share className="h-5 w-5 text-white" />
          </div>
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

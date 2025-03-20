"use client";


export default function Topbar() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold">Market Dashboard</h1>
        <nav className="hidden md:flex">
          <ul className="flex space-x-4">
            <li className="text-sm text-zinc-400 hover:text-zinc-100">REGN</li>
            <li className="text-sm text-zinc-400 hover:text-zinc-100">CELG</li>
            <li className="text-sm text-zinc-400 hover:text-zinc-100">GILD</li>
            <li className="text-sm text-zinc-400 hover:text-zinc-100">Future</li>
            <li className="text-sm text-zinc-400 hover:text-zinc-100">Worldwide Bond Overview</li>
            <li className="text-sm text-zinc-400 hover:text-zinc-100">World Markets</li>
            <li className="text-sm text-zinc-400 hover:text-zinc-100">MKT Global</li>
          </ul>
        </nav>
      </div>
      <div className="text-red-500">
        <span className="font-bold">iQ</span>
      </div>
    </div>
  </header>
  );
}

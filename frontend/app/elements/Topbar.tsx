import { User } from 'lucide-react';



export default function Topbar() {
  return (
    <header className="fixed top-0 left-0 right-0 border-b border-[#ffffff]/50 bg-[#010D26]/100 backdrop-blur-sm px-4 py-3.5 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-white-800 px-3 py-1 rounded-md hover:bg-white/10 transition-all cursor-pointer">
            AssetIQ Dashboard
          </h1>
          <nav className="hidden md:flex">
            <ul className="flex space-x-2">
              <li className="text-sm text-white-600 hover:text-[#ffffff] px-3 py-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer">REGN</li>
              <li className="text-sm text-white-600 hover:text-[#ffffff] px-3 py-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer">CELG</li>
              <li className="text-sm text-white-600 hover:text-[#ffffff] px-3 py-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer">GILD</li>
              <li className="text-sm text-white-600 hover:text-[#ffffff] px-3 py-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer">Future</li>
              <li className="text-sm text-white-600 hover:text-[#ffffff] px-3 py-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer">Worldwide Bond Overview</li>
              <li className="text-sm text-white-600 hover:text-[#ffffff] px-3 py-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer">World Markets</li>
              <li className="text-sm text-white-600 hover:text-[#ffffff] px-3 py-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer">MKT Global</li>
            </ul>
          </nav>
        </div>
        <div className="text-[#ffffff] p-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer">
          <span className="font-bold"><User /></span>
        </div>
      </div>
    </header>
  );
}

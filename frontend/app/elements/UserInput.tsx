import { Input } from "@/components/ui/input";
import { ArrowUp } from "lucide-react";

export default function UserInput() {
  return (
    <div className="h-[10vh] flex items-center justify-center bg-zinc-700 border-t border-zinc-800">
      <div className="flex-grow max-w-5xl relative">
        <Input className="bg-zinc-400 text-zinc-900"/>
        <ArrowUp className="absolute right-2 top-1.5 border text-zinc-800 rounded-lg bg-orange-400 p-1 cursor-pointer"
       />
      </div>
    </div>
  );
}

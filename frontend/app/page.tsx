import { DashboardProvider } from "@/context/DashboardContext";
import Dashboard from "./elements/Dashboard";
import Sidebar from "./elements/Sidebar";
import Topbar from "./elements/Topbar";
import UserInput from "./elements/UserInput";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <div className="h-[vh-5]">
        <Topbar />
      </div>

      <div className="flex h-[vh-85]">
        <div className="">
          <Sidebar />
        </div>
        <DashboardProvider>
          <Dashboard />
        </DashboardProvider>
      </div>

      <div className="h-16 sticky bottom-0 left-0 w-full">
        <UserInput />
      </div>
    </div>
  );
}

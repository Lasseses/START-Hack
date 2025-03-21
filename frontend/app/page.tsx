import { DashboardProvider } from "@/context/DashboardContext";
import Dashboard from "./elements/Dashboard";
import Topbar from "./elements/Topbar";
import UserInput from "./elements/UserInput";

export default function Home() {
  return (
    <DashboardProvider>
      <div className="flex min-h-screen flex-col text-zinc-100 vsc-bg">
        <div className="h-[vh-5]">
          <Topbar />
        </div>

        <div className="flex h-[85vh]">
          <Dashboard />
        </div>

        <div className="h-16 sticky bottom-0 left-0 w-full">
          <UserInput />
        </div>
      </div>
    </DashboardProvider>
  );
}

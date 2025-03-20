import Dashboard from "./elements/Dashboard";
import Sidebar from "./elements/Sidebar";
import Topbar from "./elements/Tobpar";
import UserInput from "./elements/UserInput";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <div className="h-[vh-5]">
        <Topbar />
      </div>

      <div className="flex h-[vh-85]">
        <Sidebar />
        <Dashboard />
      </div>

      <div className="h-[vh-15]">
        <UserInput/>
      </div>
    </div>
  );
}

import { Outlet } from "react-router-dom";
import Header from "./Header";

function RootLayout() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;

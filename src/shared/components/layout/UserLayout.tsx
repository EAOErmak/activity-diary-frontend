import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-background text-gray-100">
      <Navbar />
      <main className="w-full px-0 py-0 animate-fade-in mt-14">
        <Outlet />
      </main>
    </div>
  );
}

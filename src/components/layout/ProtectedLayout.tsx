export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  );
}
import React from "react";
import Navbar from "@/components/layout/Navbar";
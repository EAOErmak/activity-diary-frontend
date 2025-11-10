import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Activity Diary</h1>
        <p className="mt-2 text-gray-400">Your personal activity tracker — dashboard is coming.</p>
        <div className="mt-6">
          <Link to="/diary" className="px-4 py-2 bg-blue-600 rounded-md">Open Diary</Link>
        </div>
      </div>
    </div>
  );
}

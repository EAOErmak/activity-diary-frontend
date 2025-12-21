import React from "react";

const demo = [
  { name: "Product Design", hours: "5h" },
  { name: "Software Engineering", hours: "3h" },
  { name: "User Research", hours: "1h" },
];

export default function CategoryList() {
  return (
    <div className="space-y-2">
      {demo.map((c) => (
        <div key={c.name} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-green-400 inline-block" />
            <div className="text-sm">{c.name}</div>
          </div>
          <div className="text-xs text-gray-500">{c.hours}</div>
        </div>
      ))}
    </div>
  );
}

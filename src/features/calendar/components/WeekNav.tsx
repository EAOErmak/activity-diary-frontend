import React from "react";
import { ArrowBigRightDash, ArrowBigLeftDash } from 'lucide-react';

export default function WeekNav({
  label,
  onPrev,
  onNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onPrev} className="px-3 py-1 rounded hover:bg-slate-100"><ArrowBigLeftDash /></button>
        <h2 className="text-xl font-semibold">{label}</h2>
        <button onClick={onNext} className="px-3 py-1 rounded hover:bg-slate-100"><ArrowBigRightDash /></button>
      </div>
    </div>
  );
}

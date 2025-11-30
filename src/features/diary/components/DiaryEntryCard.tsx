import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/shared/components/ui/card";

export const DiaryEntryCard: React.FC<{ entry: any }> = ({ entry }) => {
  return (
    <motion.div layout initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
      <Link to={`/diary/${entry.id}`}>
        <Card className="flex items-start gap-4 hover:scale-[1.01] transition">
          <div style={{ width: 8, height: 48, borderRadius: 8, background: entry.color ?? "#3b82f6" }} />
          <div className="flex-1">
            <div className="font-semibold text-lg">{entry.whatHappened || "Без названия"}</div>
            <div className="text-sm text-gray-400 mt-1 line-clamp-2">{entry.anyDescription}</div>
            <div className="text-xs text-gray-500 mt-2">{new Date(entry.createdAt).toLocaleString()}</div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

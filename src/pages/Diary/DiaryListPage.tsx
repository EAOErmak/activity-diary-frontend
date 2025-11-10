import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyEntries } from "@/api/diaryApi";
import { DiaryEntryCard } from "@/components/diary/DiaryEntryCard";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function DiaryListPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: getMyEntries,
  });

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
            Мои записи
          </h1>
          <Link
            to="/diary/new"
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            + Новая запись
          </Link>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        )}

        {/* Entries List */}
        {!isLoading && data.length > 0 && (
          <motion.div
            layout
            className="grid gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08 },
              },
            }}
          >
            {data.map((entry) => (
              <motion.div
                key={entry.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <DiaryEntryCard entry={entry} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && data.length === 0 && (
          <div className="text-center mt-20 text-gray-500 dark:text-gray-400">
            <p>Пока нет ни одной записи 😴</p>
            <Link
              to="/diary/new"
              className="text-blue-600 hover:underline font-medium"
            >
              Создать первую
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

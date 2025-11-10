import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  delay = 0
}: {
  title: string;
  value: string | number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-slate-900/70 backdrop-blur-lg p-4 rounded-2xl shadow-lg border border-slate-800 hover:border-slate-700 hover:shadow-slate-700/20 transition"
    >
      <h3 className="text-gray-400 text-sm">{title}</h3>
      <div className="text-3xl font-semibold text-white mt-1">{value}</div>
    </motion.div>
  );
}

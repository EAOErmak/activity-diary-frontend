import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
export const DiaryEntryCard = ({ entry }) => {
    return (_jsx(motion.div, { layout: true, initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, children: _jsx(Link, { to: `/diary/${entry.id}`, children: _jsxs(Card, { className: "flex items-start gap-4 hover:scale-[1.01] transition", children: [_jsx("div", { style: { width: 8, height: 48, borderRadius: 8, background: entry.color ?? "#3b82f6" } }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-semibold text-lg", children: entry.whatHappened || "Без названия" }), _jsx("div", { className: "text-sm text-gray-400 mt-1 line-clamp-2", children: entry.anyDescription }), _jsx("div", { className: "text-xs text-gray-500 mt-2", children: new Date(entry.createdAt).toLocaleString() })] })] }) }) }));
};

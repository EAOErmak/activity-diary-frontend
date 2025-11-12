import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { diaryApi } from "@/api/diaryApi";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import { Link } from "react-router-dom";
export default function DiaryListPage() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [date, setDate] = useState(undefined);
    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const data = await diaryApi.getMyEntries();
                setEntries(data);
            }
            catch (err) {
                setError(err?.response?.data || err.message);
            }
            finally {
                setLoading(false);
            }
        };
        fetchEntries();
    }, []);
    const filtered = useMemo(() => {
        if (!entries?.length)
            return [];
        return entries.filter((e) => {
            const byStatus = status ? e.status === status : true;
            const what = (e.what ?? "").toLowerCase();
            const bySearch = search ? what.includes(search.toLowerCase()) : true;
            const byDate = (() => {
                if (!date)
                    return true;
                if (!e.whenStarted)
                    return false;
                try {
                    const entryDate = new Date(e.whenStarted);
                    return entryDate.toDateString() === date.toDateString();
                }
                catch {
                    return false;
                }
            })();
            return byStatus && bySearch && byDate;
        });
    }, [entries, status, search, date]);
    if (loading)
        return _jsx("p", { className: "text-white text-center p-10", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430..." });
    if (error)
        return (_jsxs("p", { className: "text-red-400 text-center p-10", children: ["\u041E\u0448\u0438\u0431\u043A\u0430: ", error] }));
    return (_jsxs("div", { className: "min-h-screen bg-[#0E1420] text-white p-6 sm:p-10", children: [_jsx("h1", { className: "text-3xl font-bold mb-8 text-blue-400 text-center", children: "\u041C\u043E\u0438 \u0437\u0430\u043F\u0438\u0441\u0438" }), _jsx("div", { className: "w-full max-w-6xl mx-auto", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-10 bg-[#151C2C]/70 backdrop-blur-md p-5 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)] border border-slate-700/50", children: [_jsxs("div", { className: "flex flex-col flex-1 min-w-[200px]", children: [_jsx("label", { className: "text-gray-300 text-sm mb-1", children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsxs(Select, { value: status || "ALL", onValueChange: (v) => setStatus(v === "ALL" ? "" : v), children: [_jsx(SelectTrigger, { className: "bg-[#1C2435] border-none text-gray-100 rounded-2xl w-full h-11 px-4 text-sm focus:ring-2 focus:ring-blue-500", children: _jsx(SelectValue, { placeholder: "\u0412\u0441\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u044B" }) }), _jsxs(SelectContent, { className: "bg-[#1C2435] border border-slate-700/60 text-gray-200 rounded-2xl shadow-lg", children: [_jsx(SelectItem, { value: "ALL", children: "\u0412\u0441\u0435" }), _jsx(SelectItem, { value: "ACTIVE", children: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439" }), _jsx(SelectItem, { value: "PLANNED", children: "\u0417\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439" }), _jsx(SelectItem, { value: "FINISHED", children: "\u0417\u0430\u0432\u0435\u0440\u0448\u0451\u043D\u043D\u044B\u0439" })] })] })] }), _jsxs("div", { className: "flex flex-col flex-1 min-w-[200px]", children: [_jsx("label", { className: "text-gray-300 text-sm mb-1", children: "\u041F\u043E\u0438\u0441\u043A" }), _jsx("input", { type: "text", placeholder: "\uD83D\uDD0D \u041F\u043E\u0438\u0441\u043A \u043F\u043E \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044E", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full bg-[#1C2435] text-gray-100 border-none rounded-2xl px-4 py-2 h-11 focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex flex-col flex-1 min-w-[200px]", children: [_jsx("label", { className: "text-gray-300 text-sm mb-1", children: "\u0414\u0430\u0442\u0430" }), _jsx("div", { className: "bg-[#1C2435] rounded-2xl h-11 flex items-center px-3", children: _jsx(DatePicker, { date: date, setDate: setDate }) })] }), _jsx("div", { className: "flex flex-col justify-end", children: _jsx("button", { onClick: () => {
                                    setStatus("");
                                    setSearch("");
                                    setDate(undefined);
                                }, className: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-6 py-2 rounded-2xl font-semibold text-sm shadow-md shadow-blue-800/30 transition-all h-11", children: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C" }) })] }) }), _jsx(AnimatePresence, { children: filtered.length === 0 ? (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "text-gray-400 text-center mt-20", children: [_jsx("p", { children: "\u041D\u0435\u0442 \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \uD83D\uDE34" }), _jsx(Link, { to: "/diary/new", className: "mt-3 inline-block text-blue-500 hover:underline", children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u044C" })] })) : (_jsx(motion.div, { layout: true, className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: filtered.map((entry) => (_jsxs(motion.div, { layout: true, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, whileHover: { scale: 1.02 }, transition: { duration: 0.25 }, className: "relative bg-[#151C2C]/90 border border-slate-700/60 rounded-2xl p-6 shadow-lg hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] transition-all duration-300", children: [_jsx(Link, { to: `/diary/edit/${entry.id}`, className: "absolute top-3 right-3 bg-blue-600/80 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full transition", children: "\u270F\uFE0F \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C" }), _jsx("h2", { className: "text-xl font-semibold text-blue-400 mb-1", children: entry.what || "Без названия" }), _jsx("p", { className: "text-gray-400 text-sm mb-2", children: entry.whatHappened || "Без описания" }), _jsx("div", { className: "text-gray-500 text-xs mb-2", children: entry.whenStarted
                                    ? new Date(entry.whenStarted).toLocaleDateString()
                                    : "Дата не указана" }), _jsx("span", { className: `inline-block text-sm font-medium px-3 py-1 rounded-full ${entry.status === "FINISHED"
                                    ? "bg-green-600/20 text-green-400"
                                    : entry.status === "PLANNED"
                                        ? "bg-yellow-600/20 text-yellow-400"
                                        : "bg-blue-600/20 text-blue-400"}`, children: entry.status || "—" })] }, entry.id))) })) })] }));
}

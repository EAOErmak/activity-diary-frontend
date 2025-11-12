import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { diaryApi } from "@/api/diaryApi";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Edit3, Calendar, Activity } from "lucide-react";
export default function DiaryDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchEntry = async () => {
            try {
                const data = await diaryApi.getEntry(id ? Number(id) : 0);
                setEntry(data);
            }
            catch (err) {
                setError(err?.response?.data || err.message);
            }
            finally {
                setLoading(false);
            }
        };
        fetchEntry();
    }, [id]);
    if (loading)
        return _jsx("p", { className: "text-center text-white mt-20", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430..." });
    if (error)
        return _jsxs("p", { className: "text-center text-red-400 mt-20", children: ["\u041E\u0448\u0438\u0431\u043A\u0430: ", error] });
    if (!entry)
        return _jsx("p", { className: "text-center text-gray-400 mt-20", children: "\u0417\u0430\u043F\u0438\u0441\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430" });
    return (_jsxs("div", { className: "min-h-screen bg-[#0E1420] text-white p-6 sm:p-10", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("button", { onClick: () => navigate(-1), className: "flex items-center gap-2 text-gray-300 hover:text-blue-400 transition", children: [_jsx(ArrowLeft, { className: "w-5 h-5" }), " \u041D\u0430\u0437\u0430\u0434"] }), _jsxs(Button, { onClick: () => navigate(`/diary/${id}/edit`), className: "flex items-center gap-2 bg-blue-600 hover:bg-blue-500", children: [_jsx(Edit3, { className: "w-4 h-4" }), " \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C"] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, className: "max-w-3xl mx-auto bg-[#151C2C]/90 border border-slate-700/60 rounded-3xl p-8 shadow-xl", children: [_jsx("h1", { className: "text-3xl font-bold text-blue-400 mb-4", children: entry.what || "Без названия" }), _jsx("p", { className: "text-gray-400 text-lg mb-6", children: entry.whatHappened || "Без описания" }), _jsxs("div", { className: "flex flex-wrap gap-6 text-gray-300 mb-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5 text-blue-400" }), entry.whenStarted
                                        ? new Date(entry.whenStarted).toLocaleDateString()
                                        : "Дата не указана"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "w-5 h-5 text-blue-400" }), _jsx("span", { className: `px-3 py-1 rounded-full text-sm font-medium ${entry.status === "FINISHED"
                                            ? "bg-green-600/20 text-green-400"
                                            : entry.status === "PLANNED"
                                                ? "bg-yellow-600/20 text-yellow-400"
                                                : "bg-blue-600/20 text-blue-400"}`, children: entry.status })] })] }), entry.anyDescription && (_jsxs("div", { className: "text-gray-300 mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-blue-400 mb-2", children: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439" }), _jsx("p", { children: entry.anyDescription })] })), entry.whatDidYouDo?.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-blue-400 mb-3", children: "\u0410\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438" }), _jsx("ul", { className: "list-disc pl-5 space-y-2 text-gray-300", children: entry.whatDidYouDo.map((act, idx) => (_jsxs("li", { children: [_jsx("span", { className: "font-medium text-blue-400", children: act.title }), act.description && ` — ${act.description}`, " (", act.count, ")"] }, idx))) })] }))] })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { diaryApi } from "@/api/diaryApi";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
export default function DiaryEditPage() {
    const nav = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [what, setWhat] = useState("");
    const [whatHappened, setWhatHappened] = useState("");
    const [anyDescription, setAnyDescription] = useState("");
    const [howYouWereFeeling, setFeeling] = useState(3);
    const [status, setStatus] = useState("ACTIVE");
    const [whenStarted, setWhenStarted] = useState("");
    const [whenEnded, setWhenEnded] = useState("");
    const [activities, setActivities] = useState([{ title: "", description: "", count: 1 }]);
    useEffect(() => {
        const fetchEntry = async () => {
            try {
                const data = await diaryApi.getEntry(Number(id));
                setWhat(data.what || "");
                setWhatHappened(data.whatHappened || "");
                setAnyDescription(data.anyDescription || "");
                setFeeling(data.howYouWereFeeling || 3);
                setStatus(data.status || "ACTIVE");
                setWhenStarted(data.whenStarted || "");
                setWhenEnded(data.whenEnded || "");
                setActivities(data.whatDidYouDo?.length
                    ? data.whatDidYouDo.map((a) => ({
                        title: a.title ?? "",
                        description: a.description ?? "",
                        count: a.count ?? 1,
                    }))
                    : [{ title: "", description: "", count: 1 }]);
            }
            catch (err) {
                console.error(err);
                setError(err?.response?.data?.message || "Ошибка при загрузке данных");
            }
            finally {
                setLoading(false);
            }
        };
        fetchEntry();
    }, [id]);
    const handleAddActivity = () => {
        setActivities((prev) => [...prev, { title: "", description: "", count: 1 }]);
    };
    const handleRemoveActivity = (index) => {
        setActivities((prev) => prev.filter((_, i) => i !== index));
    };
    const handleActivityChange = (index, field, value) => {
        setActivities((prev) => prev.map((act, i) => (i === index ? { ...act, [field]: value } : act)));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const start = new Date(whenStarted);
        const end = new Date(whenEnded);
        const duration = Math.round((end.getTime() - start.getTime()) / 60000);
        const payload = {
            what,
            whatHappened,
            anyDescription,
            howYouWereFeeling,
            status,
            duration,
            whenStarted,
            whenEnded,
            whatDidYouDo: activities.filter((a) => a.title.trim() !== ""),
        };
        try {
            await diaryApi.updateEntry(Number(id), payload);
            alert("✅ Запись успешно обновлена!");
            nav(`/diary/${id}`);
        }
        catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Ошибка при обновлении записи");
        }
    };
    if (loading)
        return _jsx("p", { className: "text-white text-center p-10", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430..." });
    if (error)
        return (_jsxs("p", { className: "text-red-400 text-center p-10", children: ["\u041E\u0448\u0438\u0431\u043A\u0430: ", error] }));
    return (_jsx("div", { className: "min-h-screen w-full bg-gradient-to-b from-[#0E1420] via-[#101725] to-[#131B2F] text-white", children: _jsxs(Card, { className: "w-full h-full bg-transparent border-none shadow-none !rounded-none text-gray-100 p-6 sm:p-8 md:p-10", children: [_jsx("h2", { className: "text-2xl sm:text-3xl font-extrabold mb-2 text-center text-blue-400 tracking-tight", children: "\u270F\uFE0F \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0437\u0430\u043F\u0438\u0441\u0438" }), _jsx("p", { className: "text-center text-gray-400 mb-6 sm:mb-10 text-sm sm:text-base", children: "\u0412\u043D\u0435\u0441\u0438 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0438 \u0437\u0430\u043F\u0438\u0441\u044C \uD83D\uDCBE" }), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-6 sm:gap-8", children: [_jsx(Input, { value: what, onChange: (e) => setWhat(e.target.value), placeholder: "\u0427\u0442\u043E \u0441\u0434\u0435\u043B\u0430\u043B", className: "bg-[#1C2435] border-none focus:ring-2 focus:ring-blue-500 rounded-2xl px-4 py-3 placeholder-gray-500 text-gray-100", required: true }), _jsx(Input, { value: whatHappened, onChange: (e) => setWhatHappened(e.target.value), placeholder: "\u0427\u0442\u043E \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u0438\u043B\u043E", className: "bg-[#1C2435] border-none focus:ring-2 focus:ring-blue-500 rounded-2xl px-4 py-3 placeholder-gray-500 text-gray-100", required: true }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-gray-300 text-sm", children: "\u041A\u043E\u0433\u0434\u0430 \u043D\u0430\u0447\u0430\u043B" }), _jsx(DatePicker, { date: whenStarted ? new Date(whenStarted) : undefined, setDate: (d) => setWhenStarted(d?.toISOString() || "") })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-gray-300 text-sm", children: "\u041A\u043E\u0433\u0434\u0430 \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u043B" }), _jsx(DatePicker, { date: whenEnded ? new Date(whenEnded) : undefined, setDate: (d) => setWhenEnded(d?.toISOString() || "") })] })] }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("label", { className: "text-gray-300 text-sm", children: "\u0421\u0430\u043C\u043E\u0447\u0443\u0432\u0441\u0442\u0432\u0438\u0435" }), _jsx("div", { className: "flex justify-between gap-2 sm:gap-3", children: [1, 2, 3, 4, 5].map((lvl) => {
                                        const colors = [
                                            "bg-red-500",
                                            "bg-orange-500",
                                            "bg-yellow-500",
                                            "bg-lime-500",
                                            "bg-green-500",
                                        ];
                                        return (_jsx("button", { type: "button", onClick: () => setFeeling(lvl), className: `w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all transform hover:scale-110 ${colors[lvl - 1]} ${lvl === howYouWereFeeling
                                                ? "ring-4 ring-blue-400 shadow-lg"
                                                : "opacity-70"}` }, lvl));
                                    }) })] }), _jsx(Textarea, { value: anyDescription, onChange: (e) => setAnyDescription(e.target.value), placeholder: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 / \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439", className: "bg-[#1C2435] border-none focus:ring-2 focus:ring-blue-500 rounded-2xl p-4 placeholder-gray-500 text-gray-100 min-h-[100px]" }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-gray-300 text-sm", children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsxs(Select, { value: status, onValueChange: (v) => setStatus(v), children: [_jsx(SelectTrigger, { className: "bg-[#1C2435] border-none text-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500", children: _jsx(SelectValue, { placeholder: "\u0412\u044B\u0431\u0435\u0440\u0438 \u0441\u0442\u0430\u0442\u0443\u0441" }) }), _jsxs(SelectContent, { className: "bg-[#1C2435] border border-slate-700/60 text-gray-200 rounded-2xl shadow-lg", children: [_jsx(SelectItem, { value: "ACTIVE", children: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439" }), _jsx(SelectItem, { value: "PLANNED", children: "\u0417\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439" }), _jsx(SelectItem, { value: "FINISHED", children: "\u0417\u0430\u0432\u0435\u0440\u0448\u0451\u043D\u043D\u044B\u0439" })] })] })] }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsx("label", { className: "text-gray-300 text-sm", children: "\u0410\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438" }), activities.map((act, idx) => (_jsxs("div", { className: "relative flex flex-col sm:flex-row items-center gap-3 p-4 bg-[#1C2435] rounded-2xl border border-slate-700/60 hover:border-blue-500/60 transition-all duration-300", children: [_jsx(Input, { placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", value: act.title, onChange: (e) => handleActivityChange(idx, "title", e.target.value), className: "w-full bg-[#232C45] border-none rounded-xl px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500" }), _jsx(Input, { placeholder: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", value: act.description, onChange: (e) => handleActivityChange(idx, "description", e.target.value), className: "w-full bg-[#232C45] border-none rounded-xl px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500" }), _jsx(Input, { type: "number", min: 1, value: act.count, onChange: (e) => handleActivityChange(idx, "count", Number(e.target.value)), placeholder: "\u041A\u043E\u043B-\u0432\u043E", className: "w-full sm:w-24 bg-[#232C45] border-none rounded-xl px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 text-center" }), activities.length > 1 && (_jsx(Button, { type: "button", onClick: () => handleRemoveActivity(idx), className: "bg-red-600 hover:bg-red-700 w-8 h-8 p-0 rounded-full flex items-center justify-center text-sm mt-2 sm:mt-0", children: "\u2715" }))] }, idx))), _jsx(Button, { type: "button", onClick: handleAddActivity, className: "mt-2 w-full bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-500 hover:to-lime-500 rounded-2xl py-3 font-medium shadow-md shadow-green-700/20 transition", children: "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C" })] }), _jsx(Button, { type: "submit", className: "w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full py-4 text-lg font-semibold shadow-md shadow-blue-800/30 transition-all duration-300", children: "\uD83D\uDCBE \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F" })] })] }) }));
}

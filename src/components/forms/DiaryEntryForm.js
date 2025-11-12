import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { diaryApi } from "@/api/diaryApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/Card";
export default function DiaryEntryForm() {
    const nav = useNavigate();
    const [what, setWhat] = useState("");
    const [whatHappened, setWhatHappened] = useState("");
    const [anyDescription, setAnyDescription] = useState("");
    const [howYouWereFeeling, setFeeling] = useState(3);
    const [status, setStatus] = useState("ACTIVE");
    const [whenStarted, setWhenStarted] = useState("");
    const [whenEnded, setWhenEnded] = useState("");
    const [activities, setActivities] = useState([
        { title: "", description: "", count: 1 },
    ]);
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
            await diaryApi.createEntry(payload);
            alert("✅ Запись успешно добавлена!");
            nav("/diary");
        }
        catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Ошибка при создании записи");
        }
    };
    return (_jsxs(Card, { className: "max-w-2xl mx-auto bg-slate-900 text-white rounded-2xl p-6 mt-6 shadow-lg", children: [_jsx("h2", { className: "text-2xl font-semibold mb-4 text-center", children: "\u041D\u043E\u0432\u0430\u044F \u0437\u0430\u043F\u0438\u0441\u044C" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block mb-1 text-gray-300", children: "\u0427\u0442\u043E \u0441\u0434\u0435\u043B\u0430\u043B" }), _jsx(Input, { value: what, onChange: (e) => setWhat(e.target.value), placeholder: "\u0421\u0434\u0435\u043B\u0430\u043B JWT \u0438 email verification", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block mb-1 text-gray-300", children: "\u0427\u0442\u043E \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u0438\u043B\u043E" }), _jsx(Input, { value: whatHappened, onChange: (e) => setWhatHappened(e.target.value), placeholder: "\u0423\u0447\u0438\u043B\u0441\u044F Spring Boot", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block mb-1 text-gray-300", children: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 / \u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439" }), _jsx(Textarea, { value: anyDescription, onChange: (e) => setAnyDescription(e.target.value), placeholder: "\u041E\u0447\u0435\u043D\u044C \u0434\u043E\u0432\u043E\u043B\u0435\u043D \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u043C!" })] }), _jsxs("div", { children: [_jsx("label", { className: "block mb-2 text-gray-300", children: "\u0410\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438" }), _jsx("div", { className: "space-y-4", children: activities.map((act, idx) => (_jsxs("div", { className: "border border-gray-700 p-3 rounded-xl bg-slate-800 relative", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Input, { placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", value: act.title, onChange: (e) => handleActivityChange(idx, "title", e.target.value) }), _jsx(Input, { type: "number", min: 1, value: act.count, onChange: (e) => handleActivityChange(idx, "count", Number(e.target.value)), placeholder: "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E" })] }), _jsx(Textarea, { className: "mt-2", placeholder: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", value: act.description, onChange: (e) => handleActivityChange(idx, "description", e.target.value) }), activities.length > 1 && (_jsx(Button, { type: "button", onClick: () => handleRemoveActivity(idx), className: "absolute top-2 right-2 bg-red-600 hover:bg-red-700", children: "\u2715" }))] }, idx))) }), _jsx(Button, { type: "button", onClick: handleAddActivity, className: "mt-3 bg-green-600 hover:bg-green-700 w-full", children: "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C" })] }), _jsxs("div", { children: [_jsx("label", { className: "block mb-2 text-gray-300", children: "\u0421\u0430\u043C\u043E\u0447\u0443\u0432\u0441\u0442\u0432\u0438\u0435 (1\u20135)" }), _jsx("div", { className: "flex gap-3", children: [1, 2, 3, 4, 5].map((lvl) => (_jsx("button", { type: "button", onClick: () => setFeeling(lvl), className: `w-10 h-10 rounded-full border-2 transition ${lvl <= howYouWereFeeling
                                        ? "bg-blue-500 border-blue-400"
                                        : "bg-slate-800 border-gray-600"}`, children: lvl }, lvl))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block mb-1 text-gray-300", children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "w-full p-2 rounded bg-slate-800 border border-gray-700", children: [_jsx("option", { value: "ACTIVE", children: "ACTIVE" }), _jsx("option", { value: "PLANNED", children: "PLANNED" }), _jsx("option", { value: "FINISHED", children: "FINISHED" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block mb-1 text-gray-300", children: "\u041A\u043E\u0433\u0434\u0430 \u043D\u0430\u0447\u0430\u043B" }), _jsx(Input, { type: "datetime-local", value: whenStarted, onChange: (e) => setWhenStarted(e.target.value), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block mb-1 text-gray-300", children: "\u041A\u043E\u0433\u0434\u0430 \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u043B" }), _jsx(Input, { type: "datetime-local", value: whenEnded, onChange: (e) => setWhenEnded(e.target.value), required: true })] })] }), _jsx(Button, { type: "submit", className: "w-full mt-4 bg-blue-600 hover:bg-blue-700", children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u044C" })] })] }));
}

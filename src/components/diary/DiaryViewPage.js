import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
export const DiaryEntryView = ({ entry }) => {
    return (_jsxs(Card, { className: "bg-slate-900 text-white p-6 rounded-xl shadow-md", children: [_jsx("h2", { className: "text-2xl font-bold mb-3", children: entry.what }), _jsxs("p", { className: "text-gray-300 mb-2", children: [_jsx("strong", { children: "\u0427\u0442\u043E \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u0438\u043B\u043E:" }), " ", entry.whatHappened] }), entry.anyDescription && (_jsx("p", { className: "text-gray-400 mb-3 italic", children: entry.anyDescription })), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm text-gray-400", children: [_jsxs("p", { children: [_jsx("strong", { children: "\u041D\u0430\u0447\u0430\u043B:" }), " ", entry.whenStarted
                                ? format(new Date(entry.whenStarted), "dd.MM.yyyy HH:mm")
                                : "-"] }), _jsxs("p", { children: [_jsx("strong", { children: "\u0417\u0430\u043A\u043E\u043D\u0447\u0438\u043B:" }), " ", entry.whenEnded
                                ? format(new Date(entry.whenEnded), "dd.MM.yyyy HH:mm")
                                : "-"] }), _jsxs("p", { children: [_jsx("strong", { children: "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C:" }), " ", entry.duration ? `${entry.duration} мин.` : "—"] }), _jsxs("p", { children: [_jsx("strong", { children: "\u0421\u0430\u043C\u043E\u0447\u0443\u0432\u0441\u0442\u0432\u0438\u0435:" }), " ", entry.howYouWereFeeling ?? "—", " / 5"] }), _jsxs("p", { children: [_jsx("strong", { children: "\u0421\u0442\u0430\u0442\u0443\u0441:" }), " ", _jsx("span", { className: entry.status === "FINISHED"
                                    ? "text-green-400"
                                    : entry.status === "PLANNED"
                                        ? "text-yellow-400"
                                        : "text-blue-400", children: entry.status })] })] }), entry.whatDidYouDo?.length ? (_jsxs("div", { className: "mt-4", children: [_jsx("h3", { className: "font-semibold text-lg mb-2", children: "\u0410\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438:" }), _jsx("ul", { className: "list-disc list-inside text-gray-300 space-y-1", children: entry.whatDidYouDo.map((item, i) => (_jsxs("li", { children: [_jsx("strong", { children: item.title }), item.description && ` — ${item.description}`, item.count && ` (${item.count})`] }, item.id ?? i))) })] })) : null, _jsxs("p", { className: "mt-4 text-xs text-gray-500", children: ["\u0421\u043E\u0437\u0434\u0430\u043D\u043E:", " ", format(new Date(entry.createdAt), "dd.MM.yyyy HH:mm")] })] }));
};

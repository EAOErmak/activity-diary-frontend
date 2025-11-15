import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocation, useNavigate } from "react-router-dom";
export default function VerifyPage() {
    const { state } = useLocation();
    const nav = useNavigate();
    const email = state?.email;
    const verifyLink = state?.verifyLink;
    if (!verifyLink) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("p", { className: "text-red-400", children: "\u041E\u0448\u0438\u0431\u043A\u0430: \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 verifyLink" }) }));
    }
    return (_jsx("div", { className: "min-h-screen grid place-items-center p-4", children: _jsxs("div", { className: "max-w-md w-full bg-slate-900 p-6 rounded-xl shadow", children: [_jsx("h2", { className: "text-xl font-semibold mb-3", children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430" }), _jsx("p", { className: "text-gray-300 mb-4", children: "\u0414\u043B\u044F \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u044F \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \u043A\u043D\u043E\u043F\u043A\u0443 \u043D\u0438\u0436\u0435." }), _jsx("a", { href: verifyLink, target: "_blank", rel: "noopener noreferrer", className: "block w-full text-center bg-green-600 hover:bg-green-700 py-2 rounded mb-4", children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0447\u0435\u0440\u0435\u0437 Telegram" }), _jsx("p", { className: "text-gray-400 text-sm mb-4", children: "\u041F\u043E\u0441\u043B\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \u043A\u043D\u043E\u043F\u043A\u0443 \u043D\u0438\u0436\u0435." }), _jsx("button", { onClick: () => nav("/login"), className: "w-full bg-gray-700 hover:bg-gray-800 py-2 rounded", children: "\u0423\u0436\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043B" })] }) }));
}

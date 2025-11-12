import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
export default function HomePage() {
    return (_jsx("div", { className: "min-h-screen p-6", children: _jsxs("div", { className: "max-w-3xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Activity Diary" }), _jsx("p", { className: "mt-2 text-gray-400", children: "Your personal activity tracker \u2014 dashboard is coming." }), _jsx("div", { className: "mt-6", children: _jsx(Link, { to: "/diary", className: "px-4 py-2 bg-blue-600 rounded-md", children: "Open Diary" }) })] }) }));
}

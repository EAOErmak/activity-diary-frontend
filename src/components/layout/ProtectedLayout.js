import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function ProtectedLayout({ children }) {
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-white", children: [_jsx(Navbar, {}), _jsx("main", { className: "p-6", children: children })] }));
}
import Navbar from "@/components/layout/Navbar";

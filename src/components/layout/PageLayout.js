import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Navbar from './Navbar';
export default function PageLayout({ children }) {
    return (_jsxs("div", { className: "min-h-screen bg-background text-gray-100", children: [_jsx(Navbar, {}), _jsx("main", { className: "w-full px-0 py-0 animate-fade-in", children: children })] }));
}

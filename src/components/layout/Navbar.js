import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useNavigate } from "react-router-dom";
import { Moon, User, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
export default function Navbar() {
    const { user, logout } = useAuthStore();
    const nav = useNavigate();
    const handleProfileClick = () => {
        if (!user) {
            alert("Вы не авторизованы. Пожалуйста, войдите в систему.");
        }
    };
    return (_jsx("header", { className: "bg-[#0E1420] border-b border-slate-800/70 shadow-md", children: _jsxs("div", { className: "max-w-7xl mx-auto flex items-center justify-between px-6 py-3", children: [_jsxs(Link, { to: "/", className: "text-xl font-bold text-white", children: ["Activity", _jsx("span", { className: "text-blue-500", children: "Diary" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Button, { variant: "ghost", size: "icon", className: "bg-[#151C2C] text-yellow-400 hover:bg-[#1C2435]", children: _jsx(Moon, { className: "h-5 w-5" }) }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx("button", { onClick: handleProfileClick, className: "bg-[#151C2C] hover:bg-[#1C2435] p-2 rounded-full text-gray-300 transition", children: _jsx(User, { className: "h-5 w-5" }) }) }), _jsx(DropdownMenuContent, { className: "w-48 bg-[#1C2435] text-gray-200 border border-slate-700/60 rounded-2xl shadow-lg mt-2", children: user ? (_jsxs(_Fragment, { children: [_jsx(DropdownMenuLabel, { className: "text-sm text-blue-400 font-semibold", children: user.username || user.email || "Пользователь" }), _jsx(DropdownMenuSeparator, { className: "bg-slate-700/60" }), _jsx(DropdownMenuItem, { onClick: () => nav("/profile"), className: "hover:bg-blue-600/30 cursor-pointer", children: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C" }), _jsx(DropdownMenuItem, { onClick: () => nav("/diary"), className: "hover:bg-blue-600/30 cursor-pointer", children: "\u041C\u043E\u0438 \u0437\u0430\u043F\u0438\u0441\u0438" }), _jsx(DropdownMenuSeparator, { className: "bg-slate-700/60" }), _jsxs(DropdownMenuItem, { onClick: () => {
                                                    logout();
                                                    nav("/login");
                                                }, className: "text-red-400 hover:bg-red-600/30 cursor-pointer flex items-center gap-2", children: [_jsx(LogOut, { className: "h-4 w-4" }), "\u0412\u044B\u0439\u0442\u0438"] })] })) : (_jsxs(_Fragment, { children: [_jsx(DropdownMenuLabel, { className: "text-gray-400 text-sm", children: "\u0413\u043E\u0441\u0442\u044C" }), _jsx(DropdownMenuSeparator, { className: "bg-slate-700/60" }), _jsx(DropdownMenuItem, { onClick: () => nav("/login"), className: "hover:bg-blue-600/30 cursor-pointer", children: "\u0412\u043E\u0439\u0442\u0438" }), _jsx(DropdownMenuItem, { onClick: () => nav("/register"), className: "hover:bg-blue-600/30 cursor-pointer", children: "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F" })] })) })] })] })] }) }));
}

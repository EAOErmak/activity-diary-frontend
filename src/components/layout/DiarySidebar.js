import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { PlusCircle, List, Settings } from "lucide-react";
export function DiarySidebar() {
    return (_jsxs("div", { className: "flex flex-col gap-4 p-4 border-r border-border h-screen", children: [_jsx(Link, { to: "/diary/new", children: _jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [_jsx(PlusCircle, { className: "mr-2 h-4 w-4" }), "New Entry"] }) }), _jsx(Link, { to: "/diary", children: _jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [_jsx(List, { className: "mr-2 h-4 w-4" }), "All Entries"] }) }), _jsx(Link, { to: "/settings", children: _jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [_jsx(Settings, { className: "mr-2 h-4 w-4" }), "Settings"] }) })] }));
}

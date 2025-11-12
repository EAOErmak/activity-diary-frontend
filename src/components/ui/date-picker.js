"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
export function DatePicker({ date, setDate, }) {
    const [time, setTime] = React.useState(date ? format(date, "HH:mm") : "00:00");
    const handleTimeChange = (e) => {
        const [hours, minutes] = e.target.value.split(":").map(Number);
        const newDate = date ? new Date(date) : new Date();
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        setTime(e.target.value);
        setDate(newDate);
    };
    return (_jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn("w-full justify-start text-left font-normal bg-[#1C2435] border-none rounded-2xl py-3 px-4 text-gray-100 hover:bg-[#232C45] hover:text-white", !date && "text-gray-500"), children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4 text-blue-400" }), date ? (format(date, "dd.MM.yyyy HH:mm")) : (_jsx("span", { children: "\u0412\u044B\u0431\u0435\u0440\u0438 \u0434\u0430\u0442\u0443 \u0438 \u0432\u0440\u0435\u043C\u044F" }))] }) }), _jsxs(PopoverContent, { className: "w-auto p-4 bg-[#1A2235] border border-slate-700 text-gray-100 rounded-2xl shadow-lg", align: "start", children: [_jsx(Calendar, { mode: "single", selected: date, onSelect: (d) => {
                            if (d) {
                                const newDate = new Date(d);
                                const [hours, minutes] = time.split(":").map(Number);
                                newDate.setHours(hours);
                                newDate.setMinutes(minutes);
                                setDate(newDate);
                            }
                        }, className: "bg-[#1A2235] text-gray-100 rounded-xl" }), _jsxs("div", { className: "flex items-center gap-3 mt-4", children: [_jsx(Clock, { className: "h-4 w-4 text-blue-400" }), _jsxs(Select, { value: time.split(":")[0], onValueChange: (value) => {
                                    const newTime = `${value}:${time.split(":")[1]}`;
                                    handleTimeChange({ target: { value: newTime } });
                                }, children: [_jsx(SelectTrigger, { className: "bg-[#232C45] border border-slate-700/60 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 w-[90px]", children: _jsx(SelectValue, { placeholder: "\u0427\u0430\u0441\u044B" }) }), _jsx(SelectContent, { className: "bg-[#1C2435] border border-slate-700/60 text-gray-100 rounded-xl shadow-lg", children: Array.from({ length: 24 }).map((_, i) => (_jsx(SelectItem, { value: String(i).padStart(2, "0"), children: String(i).padStart(2, "0") }, i))) })] }), _jsxs(Select, { value: time.split(":")[1], onValueChange: (value) => {
                                    const newTime = `${time.split(":")[0]}:${value}`;
                                    handleTimeChange({ target: { value: newTime } });
                                }, children: [_jsx(SelectTrigger, { className: "bg-[#232C45] border border-slate-700/60 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 w-[90px]", children: _jsx(SelectValue, { placeholder: "\u041C\u0438\u043D\u0443\u0442\u044B" }) }), _jsx(SelectContent, { className: "bg-[#1C2435] border border-slate-700/60 text-gray-100 rounded-xl shadow-lg", children: Array.from({ length: 60 }).map((_, i) => (_jsx(SelectItem, { value: String(i).padStart(2, "0"), children: String(i).padStart(2, "0") }, i))) })] })] })] })] }));
}

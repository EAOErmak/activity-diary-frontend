import { jsx as _jsx } from "react/jsx-runtime";
import { useContext } from "react";
import { ThemeContext } from "./theme-provider";
export const ThemeToggle = () => {
    const { theme, setTheme } = useContext(ThemeContext);
    return (_jsx("button", { onClick: () => setTheme(theme === "dark" ? "light" : "dark"), className: "px-3 py-1 rounded-md bg-slate-800 text-sm", children: theme === "dark" ? "🌙 Dark" : "☀️ Light" }));
};

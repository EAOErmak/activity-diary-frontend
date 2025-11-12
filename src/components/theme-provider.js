import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        try {
            const saved = localStorage.getItem("theme");
            if (saved === "light")
                return "light";
        }
        catch { }
        return "dark";
    });
    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark")
            root.classList.add("dark");
        else
            root.classList.remove("dark");
        try {
            localStorage.setItem("theme", theme);
        }
        catch { }
    }, [theme]);
    return (_jsx(ThemeContext.Provider, { value: { theme, setTheme }, children: children }));
};
export const ThemeContext = React.createContext({ theme: "dark", setTheme: () => { } });

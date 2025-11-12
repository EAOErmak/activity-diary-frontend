import { jsx as _jsx } from "react/jsx-runtime";
import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "./components/theme-provider";
import AppRouter from "./router/AppRouter";
export default function App() {
    return (_jsx(ThemeProvider, { children: _jsx(QueryProvider, { children: _jsx("div", { className: "min-h-screen", children: _jsx(AppRouter, {}) }) }) }));
}

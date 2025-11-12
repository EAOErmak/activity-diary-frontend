import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import LoginForm from "@/components/forms/LoginForm";
import { loginRequest } from "@/api/authApi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
export default function LoginPage() {
    const setToken = useAuthStore((s) => s.setToken);
    const nav = useNavigate();
    async function handle(data) {
        try {
            const res = await loginRequest(data);
            setToken(res.token);
            nav("/diary");
        }
        catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Ошибка логина");
        }
    }
    return (_jsx("div", { className: "min-h-screen grid place-items-center p-4", children: _jsxs("div", { className: "max-w-md w-full bg-slate-900 p-6 rounded-2xl shadow", children: [_jsx("h2", { className: "text-2xl font-semibold mb-2", children: "\u0412\u0445\u043E\u0434" }), _jsx("p", { className: "text-sm text-gray-400 mb-4", children: "\u0412\u043E\u0439\u0434\u0438\u0442\u0435 \u0432 \u0441\u0432\u043E\u0439 \u0430\u043A\u043A\u0430\u0443\u043D\u0442" }), _jsx(LoginForm, { onSubmit: handle })] }) }));
}

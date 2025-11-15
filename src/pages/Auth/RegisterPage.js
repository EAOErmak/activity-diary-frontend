import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import RegisterForm from "@/components/forms/RegisterForm";
import { registerRequest } from "@/api/authApi";
import { useNavigate } from "react-router-dom";
export default function RegisterPage() {
    const nav = useNavigate();
    async function handle(data) {
        try {
            const resp = await registerRequest(data);
            nav("/verify", {
                state: {
                    email: resp.email,
                    verifyLink: resp.verifyLink,
                    userId: resp.userId,
                },
            });
        }
        catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Ошибка регистрации");
        }
    }
    return (_jsx("div", { className: "min-h-screen grid place-items-center p-4", children: _jsxs("div", { className: "max-w-md w-full bg-slate-900 p-6 rounded-2xl shadow", children: [_jsx("h2", { className: "text-2xl font-semibold mb-2", children: "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F" }), _jsx("p", { className: "text-sm text-gray-400 mb-4", children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043D\u043E\u0432\u044B\u0439 \u0430\u043A\u043A\u0430\u0443\u043D\u0442" }), _jsx(RegisterForm, { onSubmit: handle })] }) }));
}

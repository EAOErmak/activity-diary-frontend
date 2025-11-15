import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from "react-hook-form";
export default function RegisterForm({ onSubmit, }) {
    const { register, handleSubmit, formState } = useForm({
        defaultValues: { email: "", password: "", fullName: "" },
    });
    const { isSubmitting } = formState;
    return (_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsx("input", { ...register("fullName"), placeholder: "\u0418\u043C\u044F (\u043E\u043F\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E)", className: "w-full p-2 rounded bg-slate-800 border border-slate-700" }), _jsx("input", { ...register("email", { required: true }), type: "email", placeholder: "Email", className: "w-full p-2 rounded bg-slate-800 border border-slate-700" }), _jsx("input", { ...register("password", { required: true, minLength: 6 }), type: "password", placeholder: "\u041F\u0430\u0440\u043E\u043B\u044C (\u043C\u0438\u043D 6)", className: "w-full p-2 rounded bg-slate-800 border border-slate-700" }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "w-full py-2 rounded bg-green-600 hover:bg-green-700 text-white", children: "\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u0441\u044F" })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from "react-hook-form";
export default function LoginForm({ onSubmit }) {
    const { register, handleSubmit, formState } = useForm({ defaultValues: { email: "", password: "" } });
    const { isSubmitting } = formState;
    return (_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsx("input", { ...register("email", { required: true }), type: "email", placeholder: "Email", className: "w-full p-2 rounded bg-slate-800 border border-slate-700" }), _jsx("input", { ...register("password", { required: true }), type: "password", placeholder: "\u041F\u0430\u0440\u043E\u043B\u044C", className: "w-full p-2 rounded bg-slate-800 border border-slate-700" }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white", children: "\u0412\u043E\u0439\u0442\u0438" })] }));
}

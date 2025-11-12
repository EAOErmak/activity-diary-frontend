import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { verifyEmail } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
export default function VerifyPage() {
    const [token, setToken] = useState("");
    const navigate = useNavigate();
    const onVerify = async () => {
        try {
            const resp = await verifyEmail(token);
            alert("Verified!");
            navigate("/login");
        }
        catch (e) {
            alert(e?.response?.data || "Verification failed");
        }
    };
    return (_jsx("div", { className: "min-h-[calc(100vh-64px)] flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md bg-gray-800 p-6 rounded-lg shadow", children: [_jsx("h2", { className: "text-2xl font-semibold mb-4", children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 email" }), _jsx("input", { value: token, onChange: (e) => setToken(e.target.value), placeholder: "\u0412\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0442\u043E\u043A\u0435\u043D \u0438\u0437 \u043F\u0438\u0441\u044C\u043C\u0430", className: "w-full p-2 rounded bg-gray-900 mb-3" }), _jsx("button", { onClick: onVerify, className: "w-full bg-green-600 p-2 rounded", children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C" })] }) }));
}

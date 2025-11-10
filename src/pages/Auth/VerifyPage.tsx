import React, { useState } from "react";
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
    } catch (e: any) {
      alert(e?.response?.data || "Verification failed");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Подтверждение email</h2>
        <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Вставьте токен из письма" className="w-full p-2 rounded bg-gray-900 mb-3" />
        <button onClick={onVerify} className="w-full bg-green-600 p-2 rounded">Подтвердить</button>
      </div>
    </div>
  );
}

// src/pages/Auth/VerifyPage.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyPage() {
  const { state } = useLocation();
  const nav = useNavigate();

  const email = state?.email;
  const verifyLink = state?.verifyLink;

  if (!verifyLink) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">Ошибка: отсутствует verifyLink</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="max-w-md w-full bg-slate-900 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-3">
          Подтверждение аккаунта
        </h2>

        <p className="text-gray-300 mb-4">
          Для завершения регистрации нажмите кнопку ниже.
        </p>

        <a
          href={verifyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-green-600 hover:bg-green-700 py-2 rounded mb-4"
        >
          Подтвердить через Telegram
        </a>

        <p className="text-gray-400 text-sm mb-4">
          После подтверждения нажмите кнопку ниже.
        </p>

        <button
          onClick={() => nav("/login")}
          className="w-full bg-gray-700 hover:bg-gray-800 py-2 rounded"
        >
          Уже подтвердил
        </button>
      </div>
    </div>
  );
}

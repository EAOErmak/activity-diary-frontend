import React from "react";
import { useForm } from "react-hook-form";
import type { RegisterRequest } from "@/shared/types/auth";

export default function RegisterForm({
  onSubmit,
}: {
  onSubmit: (data: RegisterRequest) => Promise<void> | void;
}) {
  const { register, handleSubmit, formState } = useForm<RegisterRequest>({
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
    },
  });

  const { isSubmitting } = formState;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input
        {...register("fullName", { required: true, minLength: 2 })}
        placeholder="Полное имя"
        className="w-full p-2 rounded bg-slate-800 border border-slate-700"
      />

      <input
        {...register("username", { required: true, minLength: 3 })}
        type="text"
        placeholder="Username"
        className="w-full p-2 rounded bg-slate-800 border border-slate-700"
      />

      <input
        {...register("password", { required: true, minLength: 8 })}
        type="password"
        placeholder="Пароль (мин 8)"
        className="w-full p-2 rounded bg-slate-800 border border-slate-700"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 rounded bg-green-600 hover:bg-green-700 text-white"
      >
        Зарегистрироваться
      </button>
    </form>
  );
}

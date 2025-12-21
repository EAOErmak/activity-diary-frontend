import React from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";

type Form = { username: string; password: string };

export default function LoginForm({
  onSubmit,
}: {
  onSubmit: (data: Form) => Promise<void> | void;
}) {
  const { register, handleSubmit, formState } = useForm<Form>({
    defaultValues: { username: "", password: "" },
  });

  const { isSubmitting } = formState;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input
        {...register("username", { required: true })}
        type="text"
        placeholder="Username"
        className="w-full p-2 rounded bg-slate-800 border border-slate-700"
      />

      <input
        {...register("password", { required: true })}
        type="password"
        placeholder="Пароль"
        className="w-full p-2 rounded bg-slate-800 border border-slate-700"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
      >
        Войти
      </button>

      {/* LINK TO REGISTER */}
      <p className="text-center text-sm text-slate-400">
        Нет аккаунта?{" "}
        <NavLink
          to="/register"
          className="text-blue-500 hover:text-blue-400 underline"
        >
          Зарегистрироваться
        </NavLink>
      </p>
    </form>
  );
}

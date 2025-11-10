import React from "react";
import { useForm } from "react-hook-form";

type Form = { email: string; password: string };

export default function LoginForm({ onSubmit }: { onSubmit: (data: Form) => Promise<void> | void }) {
  const { register, handleSubmit, formState } = useForm<Form>({ defaultValues: { email: "", password: "" } });
  const { isSubmitting } = formState;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register("email", { required: true })} type="email" placeholder="Email" className="w-full p-2 rounded bg-slate-800 border border-slate-700" />
      <input {...register("password", { required: true })} type="password" placeholder="Пароль" className="w-full p-2 rounded bg-slate-800 border border-slate-700" />
      <button type="submit" disabled={isSubmitting} className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">
        Войти
      </button>
    </form>
  );
}

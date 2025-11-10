import React from "react";
import { useForm } from "react-hook-form";

type Form = { email: string; password: string; name?: string };

export default function RegisterForm({ onSubmit }: { onSubmit: (data: Form) => Promise<void> | void }) {
  const { register, handleSubmit, formState } = useForm<Form>({ defaultValues: { email: "", password: "", name: "" } });
  const { isSubmitting } = formState;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register("name")} placeholder="Имя (опционально)" className="w-full p-2 rounded bg-slate-800 border border-slate-700" />
      <input {...register("email", { required: true })} type="email" placeholder="Email" className="w-full p-2 rounded bg-slate-800 border border-slate-700" />
      <input {...register("password", { required: true, minLength: 6 })} type="password" placeholder="Пароль (мин 6)" className="w-full p-2 rounded bg-slate-800 border border-slate-700" />
      <button type="submit" disabled={isSubmitting} className="w-full py-2 rounded bg-green-600 hover:bg-green-700 text-white">
        Зарегистрироваться
      </button>
    </form>
  );
}

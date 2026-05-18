"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await login(values);
    } catch (error) {
      toast.error(getErrorMessage(error, "Sign in failed. Check your email and password."));
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-civic-mist p-4 dark:bg-civic-ink">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input placeholder="Email" type="email" {...register("email")} />
              {errors.email && <p className="mt-1 text-sm text-rose-500">{errors.email.message}</p>}
            </div>
            <div>
              <Input placeholder="Password" type="password" {...register("password")} />
              {errors.password && <p className="mt-1 text-sm text-rose-500">{errors.password.message}</p>}
            </div>
            <Button className="w-full" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}</Button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500">No account? <Link className="font-bold text-cyan-500" href="/register">Register</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}

"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/errors";
import { authService } from "@/services/auth.service";
import type { UserRole } from "@/types/auth";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["citizen", "officer", "authority", "contractor"]),
  nid: z.string().optional(),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "citizen" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await authService.register({ ...values, role: values.role as UserRole });
      toast.success("Registration submitted for approval");
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error, "Registration failed. Please review the form and try again."));
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-civic-mist p-4 dark:bg-civic-ink">
      <Card className="w-full max-w-lg">
        <CardHeader><CardTitle className="text-3xl">Register</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <Input placeholder="Full name" {...register("name")} />
            {errors.name && <p className="text-sm text-rose-500">{errors.name.message}</p>}
            <Input placeholder="Email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-rose-500">{errors.email.message}</p>}
            <Input placeholder="Password" type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-rose-500">{errors.password.message}</p>}
            <select className="h-11 rounded-xl border bg-white/80 px-3 text-sm dark:bg-white/[0.06]" {...register("role")}>
              <option value="citizen">Citizen</option>
              <option value="officer">Police Officer</option>
              <option value="authority">Authority</option>
              <option value="contractor">Contractor</option>
            </select>
            {errors.role && <p className="text-sm text-rose-500">{errors.role.message}</p>}
            <Input placeholder="NID number" {...register("nid")} />
            <Input placeholder="Phone number" {...register("phone")} />
            <Button disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Create account"}</Button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link className="font-bold text-cyan-500" href="/login">Login</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}

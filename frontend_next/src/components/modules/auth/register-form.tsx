"use client";

import Link from "next/link";
import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/errors";
import { authService } from "@/services/auth.service";
import type { UserRole } from "@/types/auth";

type BaseValues = {
  name: string;
  email: string;
  password: string;
  confirm_password?: string;
  role: UserRole;
  // citizen
  phone?: string;
  // officer
  nid?: string;
  designation?: string;
  address?: string;
  area?: string;
  // authority
  dob?: string;
  authority_type?: string;
  // contractor
  company?: string;
  license_no?: string;
  contact_info?: string;
};

const DESIGNATIONS = ["Constable", "SI", "Inspector", "DB", "CID", "CBI"];
const AREAS = ["Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet"];
const AUTH_TYPES = ["Police HQ", "Local Authority", "Investigation Unit", "Cyber Cell"];

export function RegisterForm() {
  const { register, handleSubmit, reset, watch, setError, formState: { errors, isSubmitting } } = useForm<BaseValues>({
    defaultValues: { role: "citizen" }
  });

  const role = watch("role");

  // reset role-specific fields when role changes
  React.useEffect(() => {
    // keep name/email/password/role but clear role-specific values
    reset((prev) => ({
      name: prev?.name || "",
      email: prev?.email || "",
      password: "",
      confirm_password: "",
      role: role as UserRole
    } as Partial<BaseValues>));
  }, [role, reset]);

  async function onSubmit(values: BaseValues) {
    try {
      // Confirm password for all roles
      if (!values.confirm_password || values.confirm_password !== values.password) {
        setError("confirm_password", { message: "Passwords do not match" });
        return;
      }

      // Per-role validation
      if (values.role === "citizen") {
        if (!values.phone) {
          setError("phone", { message: "Phone number required" });
          return;
        }
        await authService.register({ name: values.name, email: values.email, password: values.password, role: "citizen", phone: values.phone });
      } else if (values.role === "officer") {
        if (!values.designation) {
          setError("designation", { message: "Designation required" });
          return;
        }
        if (!values.area) {
          setError("area", { message: "Area required" });
          return;
        }
        // call register-officer
        await authService.registerOfficer({ name: values.name, email: values.email, password: values.password, nid: values.nid, designation: values.designation, address: values.address, area: values.area });
      } else if (values.role === "authority") {
        if (!values.nid) {
          setError("nid", { message: "NID required" });
          return;
        }
        await authService.registerAuthority({ name: values.name, email: values.email, password: values.password, nid: values.nid, address: values.address });
      } else if (values.role === "contractor") {
        if (!values.license_no) {
          setError("license_no", { message: "License number required" });
          return;
        }
        await authService.registerContractor({ name: values.name, email: values.email, password: values.password, company: values.company, license_no: values.license_no, contact_info: values.contact_info });
      }

      toast.success("Registration submitted successfully");
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error, "Registration failed. Please review the form and try again."));
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-civic-mist p-4 dark:bg-civic-ink">
      <Card className="w-full max-w-lg modal-card">
        <CardHeader><CardTitle className="text-3xl">Register</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <label className="text-sm">Select Role</label>
            <select className="form-select" {...register("role") as any}>
              <option value="citizen">Citizen</option>
              <option value="officer">Police Officer</option>
              <option value="authority">Authority</option>
              <option value="contractor">Contractor</option>
            </select>

            <Input placeholder="Full name" {...register("name")} />
            {errors.name && <p className="text-sm text-rose-500">{(errors.name as any).message}</p>}
            <Input placeholder="Email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-rose-500">{(errors.email as any).message}</p>}
            <Input placeholder="Password" type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-rose-500">{(errors.password as any).message}</p>}
            <Input placeholder="Confirm Password" type="password" {...register("confirm_password")} />
            {errors.confirm_password && <p className="text-sm text-rose-500">{(errors.confirm_password as any).message}</p>}

            {/* Citizen fields */}
            {role === "citizen" && (
              <>
                <Input placeholder="Phone number" {...register("phone")} />
                {errors.phone && <p className="text-sm text-rose-500">{(errors.phone as any).message}</p>}
              </>
            )}

            {/* Officer fields */}
            {role === "officer" && (
              <>
                <Input placeholder="NID" {...register("nid")} />
                {errors.nid && <p className="text-sm text-rose-500">{(errors.nid as any).message}</p>}
                <label className="text-sm">Designation</label>
                <select className="form-select" {...register("designation") as any}>
                  <option value="">-- select designation --</option>
                  {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.designation && <p className="text-sm text-rose-500">{(errors.designation as any).message}</p>}
                <Input placeholder="Address" {...register("address")} />
                <label className="text-sm">Area</label>
                <select className="form-select" {...register("area") as any}>
                  <option value="">-- select area --</option>
                  {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                {errors.area && <p className="text-sm text-rose-500">{(errors.area as any).message}</p>}
              </>
            )}

            {/* Authority fields */}
            {role === "authority" && (
              <>
                    <Input placeholder="NID" {...register("nid")} />
                    {errors.nid && <p className="text-sm text-rose-500">{(errors.nid as any).message}</p>}
                    <Input placeholder="Address" {...register("address")} />
              </>
            )}

            {/* Contractor fields */}
            {role === "contractor" && (
              <>
                <Input placeholder="Company Name" {...register("company")} />
                <Input placeholder="License Number" {...register("license_no")} />
                {errors.license_no && <p className="text-sm text-rose-500">{(errors.license_no as any).message}</p>}
                <Input placeholder="Contact Info" {...register("contact_info")} />
              </>
            )}

            <Button disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Create account"}</Button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link className="font-bold text-cyan-500" href="/login">Login</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}

import { RoleShell } from "@/components/layout/role-shell";

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell role="citizen">{children}</RoleShell>;
}

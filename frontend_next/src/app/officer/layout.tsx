import { RoleShell } from "@/components/layout/role-shell";

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell role="officer">{children}</RoleShell>;
}

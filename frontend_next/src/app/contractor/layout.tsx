import { RoleShell } from "@/components/layout/role-shell";

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell role="contractor">{children}</RoleShell>;
}

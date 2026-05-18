import { RoleShell } from "@/components/layout/role-shell";

export default function AuthorityLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell role="authority">{children}</RoleShell>;
}

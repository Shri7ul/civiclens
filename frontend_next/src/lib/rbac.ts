import {
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  FileCheck2,
  FileText,
  FolderKanban,
  Gavel,
  Home,
  Landmark,
  ListChecks,
  LockKeyhole,
  ScrollText,
  ShieldCheck,
  UploadCloud,
  UserCheck,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import type { UserRole } from "@/types/auth";
export { protectedPrefixes, roleHomePath } from "./routes";

export const roleNavigation = {
  citizen: [
    { title: "Dashboard", href: "/citizen/dashboard", icon: Home },
    { title: "Submit Police Request / GD", href: "/citizen/submit-police-request", icon: FileText },
    { title: "My Requests", href: "/citizen/my-requests", icon: FolderKanban },
    { title: "View Tenders", href: "/citizen/tenders", icon: ScrollText },
  ],
  officer: [
    { title: "Dashboard", href: "/officer/dashboard", icon: Home },
    { title: "Assigned Cases", href: "/officer/assigned-cases", icon: BriefcaseBusiness },
    { title: "Add Case Updates", href: "/officer/case-updates", icon: ClipboardList },
  ],
  authority: [
    { title: "Dashboard", href: "/authority/dashboard", icon: Home },
    { title: "Case Queue", href: "/authority/case-queue", icon: FileCheck2 },
    { title: "Investigation Monitoring", href: "/authority/investigation-monitoring", icon: Gavel },
    { title: "Create Tender", href: "/authority/create-tender", icon: FileText },
    { title: "Tender Applications", href: "/authority/tender-applications", icon: FolderKanban },
    { title: "Awarded Projects", href: "/authority/awarded-projects", icon: FileCheck2 },
  ],
  contractor: [
    { title: "Dashboard", href: "/contractor/dashboard", icon: Home },
    { title: "View Tenders", href: "/contractor/tenders", icon: ScrollText },
    { title: "My Applications", href: "/contractor/my-applications", icon: FolderKanban },
    { title: "Awarded Projects", href: "/contractor/awarded-projects", icon: FileCheck2 },
    { title: "Documents", href: "/contractor/documents", icon: UploadCloud },
  ],
  admin: [
    { title: "Dashboard", href: "/admin/dashboard", icon: Home },
    { title: "Pending Officers", href: "/admin/pending-officers", icon: ShieldCheck },
    { title: "Pending Authorities", href: "/admin/pending-authorities", icon: Landmark },
    { title: "Pending Contractors", href: "/admin/pending-contractors", icon: BriefcaseBusiness },
    { title: "Public Cases", href: "/admin/public-cases", icon: FileText },
  ],
} satisfies Record<UserRole, Array<{ title: string; href: string; icon: ComponentType<{ className?: string }> }>>;

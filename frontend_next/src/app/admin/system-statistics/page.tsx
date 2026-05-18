import { RoleDashboard } from "@/components/modules/dashboard/role-dashboard";

export default function SystemStatisticsPage() {
  return <RoleDashboard title="System Statistics" description="Statistics loaded from /system-stats." adminStats />;
}

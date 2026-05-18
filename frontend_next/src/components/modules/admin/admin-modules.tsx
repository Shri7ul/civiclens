"use client";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableWrap, Td, Th } from "@/components/ui/table";
import { useApiQuery } from "@/hooks/use-api-query";
import { getErrorMessage } from "@/lib/errors";
import { adminService } from "@/services/admin.service";
import { useAuth } from "@/context/auth-context";

type PendingKind = "officers" | "authorities" | "contractors";

const loaders = {
  officers: adminService.pendingOfficers,
  authorities: adminService.pendingAuthorities,
  contractors: adminService.pendingContractors,
};

export function PendingUsersTable({ kind }: { kind: PendingKind }) {
  const { session } = useAuth();
  const query = useApiQuery(loaders[kind], [kind]);
  async function updateUser(userId: number, action: "approve" | "reject") {
    try {
      if (!session) {
        toast.error("Not signed in");
        return;
      }

      if (action === "approve") {
        await adminService.approveUser(userId, session.user_id);
        toast.success("User approved");
      } else {
        await adminService.rejectUser(userId, session.user_id);
        toast.success("User rejected");
      }
      query.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, `Could not ${action} user.`));
    }
  }

  if (query.loading) return <Skeleton className="h-56" />;
  if (query.error) return <EmptyState title={`Could not load pending ${kind}`} description={query.error} />;
  if (!query.data?.length) return <EmptyState title={`No pending ${kind}`} description="Approval queue is currently empty." />;
  return (
    <TableWrap>
      <Table>
        <thead><tr><Th>ID</Th><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {query.data.map((user) => (
            <tr key={user.id}>
              <Td>{user.id}</Td><Td>{user.name}</Td><Td>{user.email}</Td><Td>{user.role}</Td><Td><Badge>{user.status ?? "pending"}</Badge></Td>
              <Td className="flex gap-2"><Button size="sm" onClick={() => updateUser(user.id, "approve")}>Approve</Button><Button size="sm" variant="destructive" onClick={() => updateUser(user.id, "reject")}>Reject</Button></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  );
}

export function AuditLogsTable() {
  const query = useApiQuery(adminService.auditLogs, []);
  if (query.loading) return <Skeleton className="h-56" />;
  if (query.error) return <EmptyState title="Could not load audit logs" description={query.error} />;
  if (!query.data?.length) return <EmptyState title="No audit logs" description="Audit events from /audit-logs will appear here." />;

  return (
    <div className="space-y-3">
      {query.data.map((log: any, idx: number) => (
        <div key={idx} className="flex items-start gap-3 rounded-md border border-white/6 bg-white/3 p-3">
          <div className="h-10 w-10 flex-none overflow-hidden rounded-full bg-slate-700 text-sm font-medium text-white flex items-center justify-center">{String(log.actor_id ?? log.user_id ?? "?").slice(-2)}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-200">{log.action ?? log.details ?? "action"}</p>
              <p className="text-xs text-slate-500">{log.created_at ? new Date(log.created_at).toLocaleString() : "-"}</p>
            </div>
            {log.details && <p className="mt-1 text-xs text-slate-400">{log.details}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

import { Inbox } from "lucide-react";
import { Card } from "./card";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="grid place-items-center p-10 text-center">
      <Inbox className="h-10 w-10 text-cyan-500" />
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </Card>
  );
}

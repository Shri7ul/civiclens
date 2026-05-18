import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-civic-mist p-6 text-center dark:bg-civic-ink">
      <div>
        <p className="text-sm font-bold text-cyan-500">404</p>
        <h1 className="mt-3 text-4xl font-extrabold">Page not found</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">This CivicLens route does not exist.</p>
        <Button asChild className="mt-6"><Link href="/">Back home</Link></Button>
      </div>
    </main>
  );
}

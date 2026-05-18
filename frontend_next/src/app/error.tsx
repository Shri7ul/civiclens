"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-civic-mist p-6 text-center dark:bg-civic-ink">
      <div className="max-w-md">
        <p className="text-sm font-bold text-rose-500">Application error</p>
        <h1 className="mt-3 text-4xl font-extrabold">Something went wrong</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">{error.message || "The page could not be rendered."}</p>
        <Button className="mt-6" onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}

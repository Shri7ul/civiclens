"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/errors";

export function useApiQuery<T>(query: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    query()
      .then((result) => {
        if (mounted) setData(result);
      })
      .catch((err: unknown) => {
        if (mounted) setError(getErrorMessage(err, "Request failed"));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => refetch(), [refetch]);

  return { data, error, loading, refetch };
}

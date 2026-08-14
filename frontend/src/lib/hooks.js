import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useAsync — run an async fetcher, exposing { data, loading, error, reload, setData }.
 * `deps` re-run the fetcher when they change. `immediate` controls first run.
 */
export function useAsync(fetcher, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (mounted.current) setData(result);
      return result;
    } catch (err) {
      if (mounted.current) setError(err.friendlyMessage || 'Failed to load data.');
      throw err;
    } finally {
      if (mounted.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload: run, setData };
}

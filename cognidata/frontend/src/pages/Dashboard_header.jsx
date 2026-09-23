import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { api } from "../api/client";
import DatasetSelector from "../components/DatasetSelector";

// ═══════════════════════════════════════════════════════════════════════════════
// API CACHE HOOK - Session-level in-memory cache for GET requests  
// ═══════════════════════════════════════════════════════════════════════════════
const apiCache = new Map();

function useApiCache(key, fetcher, dependencies = []) {
  const [data, setData] = useState(() => apiCache.get(key) || null);
  const [loading, setLoading] = useState(!apiCache.has(key));

  const fetch = useCallback(async () => {
    if (apiCache.has(key)) {
      setData(apiCache.get(key));
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const result = await fetcher();
      apiCache.set(key, result);
      setData(result);
    } catch (error) {
      console.error(`Cache fetch error for ${key}:`, error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher]);

  useEffect(() => {
    fetch();
  }, [fetch, ...dependencies]);

  const invalidate = useCallback(() => {
    apiCache.delete(key);
    fetch();
  }, [key, fetch]);

  return { data, loading, invalidate };
}

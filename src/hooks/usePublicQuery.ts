import { useEffect, useState } from "react";
import { supabaseConfigured, supabaseConfigurationError } from "../services/supabase";

export type PublicQueryState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function usePublicQuery<T, P>(
  queryKey: string,
  loader: (parameter: P) => Promise<T>,
  parameter: P,
): PublicQueryState<T> {
  const [state, setState] = useState<PublicQueryState<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let isCurrent = true;

    if (!supabaseConfigured) {
      setState({ data: null, loading: false, error: supabaseConfigurationError });
      return () => {
        isCurrent = false;
      };
    }

    setState((current) => ({ ...current, loading: true, error: null }));
    loader(parameter)
      .then((data) => {
        if (isCurrent) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          const message = error instanceof Error ? error.message : "No se pudieron cargar los datos públicos.";
          setState({ data: null, loading: false, error: message });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [queryKey, loader, parameter]);

  return state;
}
import { useCallback, useState } from "react";
import { fetchFilesApi } from "@/lib/api/files";
import type { FilesData } from "@/lib/types/api";

export interface UseFetchFilesReturn {
  fetchFiles: (jobId: string) => Promise<FilesData | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useFetchFiles(): UseFetchFilesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async (jobId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchFilesApi(jobId);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch files";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    fetchFiles,
    isLoading,
    error,
    clearError,
  };
}

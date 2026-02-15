import type { FetchFilesApiResponse, FilesData } from "@/lib/types/api";

export async function fetchFilesApi(jobId: string): Promise<FilesData> {
  const response = await fetch(`/api/files/${jobId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data: FetchFilesApiResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
}

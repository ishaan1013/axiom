import { getFiles } from "@/lib/actions";
import { useQuery } from "@tanstack/react-query";
import { FilesResponse } from "./types";

export function useFiles(initialData?: FilesResponse) {
  return useQuery({
    queryKey: ["files"],
    queryFn: getFiles,
    initialData,
  });
}

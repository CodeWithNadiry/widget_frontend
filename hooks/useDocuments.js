import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useDocuments(chatbotId) {
  return useQuery({
    queryKey: ["documents", chatbotId],
    queryFn: () => apiFetch(`/document/${chatbotId}`),
    enabled: !!chatbotId,
  });
}

export function useUploadDocuments(chatbotId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => {
      const token = useAuthStore.getState().token;
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/document/upload`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Upload failed.");
        return data;
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents", chatbotId] });
    },
  });
}


export function useDeleteDocument(chatbotId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId) =>
      apiFetch(`/document/${documentId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents", chatbotId] });
    },
  });
}

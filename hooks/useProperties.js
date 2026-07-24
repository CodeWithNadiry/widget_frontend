import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: () => apiFetch("/property"),
  });
}

export function useProperty(propertyId) {
  return useQuery({
    queryKey: ["properties", propertyId],
    queryFn: () => apiFetch(`/property/${propertyId}`),
    enabled: !!propertyId,
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      apiFetch("/property", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["properties"] }),
  });
}

export function useUpdateProperty(propertyId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      apiFetch(`/property/${propertyId}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties", propertyId] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      // Same reasoning as useDeleteProperty below — the properties page
      // reads through useChatbotProperties, a separate cache key.
      qc.invalidateQueries({ queryKey: ["chatbots"] });
    },
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (propertyId) =>
      apiFetch(`/property/${propertyId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      // The properties page reads via useChatbotProperties, which lives
      // under a completely different query key (["chatbots", id,
      // "properties"]). Without this, a deleted property kept showing in
      // that list — clicking Delete on it again then 404'd since it was
      // already gone. React Query invalidates by key prefix, so this also
      // catches ["chatbots", id] and ["chatbots", id, "properties"].
      qc.invalidateQueries({ queryKey: ["chatbots"] });
    },
  });
}

export function useUploadPropertyImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ propertyId, file }) => {
      const formData = new FormData();
      formData.append("image", file);

      // Can't use apiFetch here — it force-sets Content-Type:
      // application/json, which breaks multipart/form-data (the browser
      // needs to set that header itself, boundary included). Property
      // routes require auth (unlike the public chatbot-logo route), so the
      // Bearer token is attached manually here.
      const token = useAuthStore.getState().token;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/property/${propertyId}/image`,
        {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) useAuthStore.getState().clearAuth();
        throw new Error(data.message || "Upload failed.");
      }
      return data; // { imageUrl }
    },
    onSuccess: (_data, { propertyId }) => {
      qc.invalidateQueries({ queryKey: ["properties", propertyId] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["chatbots"] });
    },
  });
}
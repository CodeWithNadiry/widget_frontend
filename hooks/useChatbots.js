import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export function useChatbots() {
  return useQuery({
    queryKey: ["chatbots"],
    queryFn: () => apiFetch("/admin/chatbots"),
  });
}

export function useChatbot(chatbotId) {
  return useQuery({
    queryKey: ["chatbots", chatbotId],
    queryFn: () => apiFetch(`/admin/chatbots/${chatbotId}`),
    enabled: !!chatbotId,
  });
}

export function useCreateChatbot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      apiFetch("/admin/chatbots", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chatbots"] }),
  });
}

export function useDeleteChatbot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chatbotId) =>
      apiFetch(`/admin/chatbots/${chatbotId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chatbots"] }),
  });
}

export function useAssignProperty(chatbotId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (propertyId) =>
      apiFetch(`/admin/chatbots/${chatbotId}/properties`, {
        method: "POST",
        body: JSON.stringify({ propertyId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatbots", chatbotId, "properties"] });
      qc.invalidateQueries({ queryKey: ["chatbots", chatbotId] });
      // The properties list page shows counts/assignment per chatbot too.
      qc.invalidateQueries({ queryKey: ["chatbots"] });
    },
  });
}

export function useRemoveProperty(chatbotId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (propertyId) =>
      apiFetch(`/admin/chatbots/${chatbotId}/properties/${propertyId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatbots", chatbotId, "properties"] });
      qc.invalidateQueries({ queryKey: ["chatbots", chatbotId] });
      qc.invalidateQueries({ queryKey: ["chatbots"] });
    },
  });
}

export function useChatbotProperties(chatbotId) {
  return useQuery({
    queryKey: ["chatbots", chatbotId, "properties"],
    queryFn: async () => {
      const data = await apiFetch(`/admin/chatbots/${chatbotId}/properties`);
      return data;
    },
    enabled: !!chatbotId,
  });
}
export function useUpdateChatbot(chatbotId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      apiFetch(`/admin/chatbots/${chatbotId}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatbots", chatbotId] });
    },
  });
}

export function useUploadChatbotLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ chatbotId, file }) => {
      const formData = new FormData();
      formData.append("logo", file);

      // This route lives on the PUBLIC chatbot router (chatbot.routes.js:
      // router.post("/:chatbotId/logo", ...)) — no /admin prefix, no auth
      // middleware. So no Authorization header needed here; the real bug
      // was that admin.service.js's getChatbotById never returned logoUrl
      // in its `attributes`, so a successful upload never showed up.
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chatbot/${chatbotId}/logo`,
        { method: "POST", body: formData },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Upload failed.");
      }
      return data; // { logoUrl }
    },
    onSuccess: (_data, { chatbotId }) => {
      qc.invalidateQueries({ queryKey: ["chatbots", chatbotId] });
      qc.invalidateQueries({ queryKey: ["chatbots"] });
    },
  });
}
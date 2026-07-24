import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials) =>
      apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),

    onSuccess: (data) => {
      setAuth(data.token, data.user);
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return () => {
    clearAuth();
    router.push("/login");
  };
}

// ─── Admin-only user management ──────────────────────────────────────────
// All of these hit /admin/users, which requires the caller to already be
// the logged-in admin (enforced server-side by isAuth + isAdmin).

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch("/admin/users"),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser(userId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      apiFetch(`/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId) =>
      apiFetch(`/admin/users/${userId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";


export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials) =>
      apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    onSuccess: () => {
      router.push("/login");
    },
  });
}

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
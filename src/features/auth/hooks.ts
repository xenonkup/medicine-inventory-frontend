"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authApi, type LoginInput } from "@/features/auth/api";
import { getErrorMessage } from "@/lib/api-client";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

// useLogin posts credentials, persists the session, and redirects.
export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (data) => {
      auth.setSession(data.access_token, data.refresh_token, data.user);
      toast.success(`ยินดีต้อนรับ ${data.user.full_name}`);
      router.replace(ROUTES.dashboard);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// useLogout clears the session and returns to the login screen.
export function useLogout() {
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      auth.clear();
      router.replace(ROUTES.login);
    },
  });
}

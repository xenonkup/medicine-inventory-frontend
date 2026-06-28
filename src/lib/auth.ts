import Cookies from "js-cookie";
import type { UserProfile } from "@/types";

// Token + profile storage. Cookies (not localStorage) so the Next.js
// middleware can read the access token at the edge for route protection.
const ACCESS_KEY = "pis_access";
const REFRESH_KEY = "pis_refresh";
const USER_KEY = "pis_user";

const cookieOpts: Cookies.CookieAttributes = {
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  expires: 7,
};

export const auth = {
  setSession(accessToken: string, refreshToken: string, user: UserProfile) {
    Cookies.set(ACCESS_KEY, accessToken, cookieOpts);
    Cookies.set(REFRESH_KEY, refreshToken, cookieOpts);
    Cookies.set(USER_KEY, JSON.stringify(user), cookieOpts);
  },

  setAccessToken(token: string) {
    Cookies.set(ACCESS_KEY, token, cookieOpts);
  },

  getAccessToken(): string | undefined {
    return Cookies.get(ACCESS_KEY);
  },

  getRefreshToken(): string | undefined {
    return Cookies.get(REFRESH_KEY);
  },

  getUser(): UserProfile | null {
    const raw = Cookies.get(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  },

  clear() {
    Cookies.remove(ACCESS_KEY);
    Cookies.remove(REFRESH_KEY);
    Cookies.remove(USER_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(Cookies.get(ACCESS_KEY));
  },
};

export const ACCESS_COOKIE = ACCESS_KEY;

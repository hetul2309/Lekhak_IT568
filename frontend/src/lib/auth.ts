const PRIMARY_TOKEN_STORAGE_KEY = "lekhak_token";
const TOKEN_STORAGE_KEYS = [PRIMARY_TOKEN_STORAGE_KEY, "token", "authToken", "jwt"] as const;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  role: "user" | "admin";
  bio?: string;
  profilePicture?: string;
  followers?: string[];
  following?: string[];
  savedBlogs?: string[];
}

interface AuthResponse extends AuthUser {
  token: string;
}

interface JwtPayload {
  id?: string;
  _id?: string;
  userId?: string;
  sub?: string;
}

const parseJwtPayload = (token: string): JwtPayload | null => {
  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(window.atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
};

export const getStoredAuthToken = () => {
  if (typeof window === "undefined") return null;

  for (const key of TOKEN_STORAGE_KEYS) {
    const token = window.localStorage.getItem(key);
    if (token) return token;
  }

  return null;
};

export const setStoredAuthToken = (token: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRIMARY_TOKEN_STORAGE_KEY, token);
};

export const clearStoredAuthToken = () => {
  if (typeof window === "undefined") return;

  for (const key of TOKEN_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }
};

export const getCurrentUserIdFromToken = () => {
  const token = getStoredAuthToken();
  if (!token) return null;

  const payload = parseJwtPayload(token);
  return payload?.id || payload?._id || payload?.userId || payload?.sub || null;
};

export const getAuthHeaders = () => {
  const token = getStoredAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const hasStoredAuthToken = () => Boolean(getStoredAuthToken());

const fetchAuthJson = async <T>(
  path: string,
  options?: {
    method?: "GET" | "POST";
    body?: unknown;
    auth?: boolean;
  },
) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options?.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options?.auth ? getAuthHeaders() : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const data = (await response.json()) as { message?: string };
      if (data.message) message = data.message;
    } catch {
      // Ignore non-JSON response bodies.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
};

export const loginRequest = async (email: string, password: string) =>
  fetchAuthJson<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });

export const registerRequest = async (input: {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}) =>
  fetchAuthJson<AuthResponse>("/auth/register", {
    method: "POST",
    body: input,
  });

export const fetchCurrentUser = async () =>
  fetchAuthJson<AuthUser>("/auth/me", {
    auth: true,
  });

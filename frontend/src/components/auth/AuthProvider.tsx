import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearStoredAuthToken,
  fetchCurrentUser,
  hasStoredAuthToken,
  loginRequest,
  registerRequest,
  setStoredAuthToken,
  type AuthUser,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    if (!hasStoredAuthToken()) {
      setUser(null);
      return;
    }

    try {
      const me = await fetchCurrentUser();
      setUser(me);
    } catch {
      clearStoredAuthToken();
      setUser(null);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    setStoredAuthToken(result.token);
    setUser(result);
  };

  const register = async (input: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) => {
    const result = await registerRequest(input);
    setStoredAuthToken(result.token);
    setUser(result);
  };

  const logout = () => {
    clearStoredAuthToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

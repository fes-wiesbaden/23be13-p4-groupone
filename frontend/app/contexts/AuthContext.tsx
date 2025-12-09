import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import type {Role, User} from "~/types/models";
import API_CONFIG from "~/apiConfig";
import {useNavigate} from "react-router";

/**
 * @author: Daniel Hess
 * <p>
 * Context provider for authentication. Stores the currently authenticated user in a state.
 * Provides functions to login and logout the user.
 * </p>
 *
 **/

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate()

  const checkAuth = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/users/me`, {
        credentials: "include",
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        console.error(`Auth check failed: ${res.status}`);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true)
    checkAuth();
  }, [checkAuth]);

  const login = (userData: User) => {
    setUser(userData);
    if (userData.needsPasswordChange) {
        navigate("/change-password")
    } else {
        navigate("/")
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_CONFIG.BASE_URL}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

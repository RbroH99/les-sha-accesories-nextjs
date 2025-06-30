"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Interfaces
interface Address {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  defaultAddress?: Address;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    phone?: string
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  fetchWithAuth: (
    url: string,
    options?: RequestInit
  ) => Promise<Response | undefined>;
}

interface DecodedToken {
  userId: string;
  username: string;
  email: string;
  role: "user" | "admin";
  exp: number;
}

// Context
const AuthContext = createContext<AuthContextType | null>(null);

// Helper Functions
const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

// AuthProvider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const refreshToken = useCallback(async () => {
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        logout();
        return null;
      }

      const { accessToken: newAccessToken } = await response.json();
      setAccessToken(newAccessToken);
      Cookies.set("accessToken", newAccessToken, {
        expires: new Date(new Date().getTime() + 15 * 60 * 1000), // 15 minutes
      });
      return newAccessToken;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      logout();
      return null;
    }
  }, []);

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      let token = accessToken;

      if (token) {
        const decoded: DecodedToken | null = decodeToken(token);
        if (!decoded || decoded.exp * 1000 < Date.now()) {
          token = await refreshToken();
        }
      } else {
        token = await refreshToken();
      }

      if (!token) {
        return undefined; // No valid token, cannot proceed
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          // Retry the request with the new token
          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json",
            },
          });
        }
      }

      return response;
    },
    [accessToken, refreshToken]
  );

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setAccessToken(token);
        setUser({
          id: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role,
        });
      } else {
        refreshToken();
      }
    }
  }, [refreshToken]);

  const login = async (
    identifier: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAccessToken(data.accessToken);
        Cookies.set("accessToken", data.accessToken, {
          expires: new Date(new Date().getTime() + 15 * 60 * 1000), // 15 minutes
        });
        Cookies.set("refreshToken", data.refreshToken, { expires: 7 }); // 7 days
        setUser(data.user);
        return true;
      } else {
        console.error("Login failed:", data.error);
        return false;
      }
    } catch (error) {
      console.error("Network error during login:", error);
      return false;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    phone?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          firstName,
          lastName,
          phone,
        }),
      });

      if (response.ok) {
        return await login(username, password);
      } else {
        const data = await response.json();
        console.error("Registration failed:", data.error);
        return false;
      }
    } catch (error) {
      console.error("Network error during registration:", error);
      return false;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetchWithAuth("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      if (response && response.ok) {
        const data = await response.json();
        setUser((prev) => (prev ? { ...prev, ...data.user } : null));
        return true;
      } else {
        const errorData = await response?.json();
        console.error("Profile update failed:", errorData?.error);
        return false;
      }
    } catch (error) {
      console.error("Network error during profile update:", error);
      return false;
    }
  };

  const logout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateProfile, fetchWithAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

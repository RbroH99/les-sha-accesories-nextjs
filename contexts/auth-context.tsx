"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import Cookies from "js-cookie";

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
    phone?: string,
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: {
    username?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    defaultAddress?: Address;
  }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      // In a real app, you would verify the token on the server
      // and fetch user data based on the token's payload.
      // For this example, we'll decode it directly (less secure for production)
      try {
        const decodedToken: any = JSON.parse(atob(token.split('.')[1])); // Basic JWT decode
        setUser({
          id: decodedToken.userId,
          username: decodedToken.username,
          email: decodedToken.email,
          role: decodedToken.role,
        });
      } catch (error) {
        console.error("Error decoding token:", error);
        Cookies.remove("token");
      }
    }
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Cookies.set("token", data.token, { expires: 7 }); // Token expires in 7 days
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
    phone?: string,
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, firstName, lastName, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        // After successful registration, attempt to log in the user
        const loginSuccess = await login(username, password); // Use username for login after registration
        return loginSuccess;
      } else {
        console.error("Registration failed:", data.error);
        return false;
      }
    } catch (error) {
      console.error("Network error during registration:", error);
      return false;
    }
  };

  const updateProfile = async (updates: {
    username?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    defaultAddress?: Address;
  }): Promise<boolean> => {
    if (!user) return false;

    try {
      const token = Cookies.get("token");
      if (!token) {
        console.error("No token found for profile update.");
        return false;
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local user state with the data returned from the API
        setUser((prevUser) => (prevUser ? { ...prevUser, ...data.user } : null));
        return true;
      } else {
        console.error("Profile update failed:", data.error);
        return false;
      }
    } catch (error) {
      console.error("Network error during profile update:", error);
      return false;
    }
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
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

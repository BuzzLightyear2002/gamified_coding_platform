"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { revalidateUserData } from "@/app/actions/revalidate"; // Import revalidate function

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user data with cache invalidation
  const fetchUser = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
          next: { tags: ["user-data"] }, // Tagging user data
        }
      );

      if (!response.ok) throw new Error("Failed to fetch user");

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Login function
  const login = async (token) => {
    localStorage.setItem("authToken", token);

    try {
      await revalidateUserData(); // Revalidate cache
      fetchUser(); // Fetch updated user data
      router.push("/"); // Redirect to home
    } catch (error) {
      console.error("Failed to update user after login:", error);
      logout();
    }
  };

  // Logout function
  const logout = async () => {
    localStorage.removeItem("authToken");
    setUser(null);
    await revalidateUserData(); // Ensure cache updates
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

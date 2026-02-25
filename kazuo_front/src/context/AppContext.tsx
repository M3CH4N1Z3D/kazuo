"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { userData } from "@/interfaces/types";
import { AppContextType } from "@/interfaces/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage<boolean>(
    "isLoggedIn",
    false
  );
  const [userData, setUserData] = useState<userData | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLoginStatus = localStorage.getItem("isLoggedIn");
      const storedUserData = localStorage.getItem("userData");
      if (storedLoginStatus === "true" && storedUserData) {
        setIsLoggedIn(true);
        setUserData(JSON.parse(storedUserData));
      }
    }
  }, []);

  useEffect(() => {
    console.log(
      `Estado de la sesión: ${isLoggedIn ? "Iniciada" : "No iniciada"}`
    );
  }, []);

  const login = async (loginData: any) => {
    try {
      setIsLoggedIn(true);
      setUserData(loginData);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userData", JSON.stringify(loginData));
      // if (userData?.token) {
      if (loginData.token) {
        localStorage.setItem("token", loginData.token);
      }
      if (loginData.igmUrl) {
        localStorage.setItem("igmUrl", loginData.igmUrl);
      }
    } catch (error) {
      console.error("Error de login", error);
      throw error;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("igmUrl");
    sessionStorage.removeItem("chatConversation");
    window.location.href = "/Login";
  };

  const markTourAsSeen = async () => {
    if (!userData) return;

    // Update local state immediately
    const updatedUser = { ...userData, hasSeenTour: true };
    setUserData(updatedUser);
    localStorage.setItem("userData", JSON.stringify(updatedUser));

    // Update backend
    try {
      const kazuo_back = process.env.NEXT_PUBLIC_API_URL;
      await fetch(`${kazuo_back}/users/${userData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.token}`,
        },
        body: JSON.stringify({ hasSeenTour: true }),
      });
    } catch (error) {
      console.error("Error updating tour status", error);
    }
  };

  const updateTourProgress = async (tourKey: string, completed: boolean) => {
    if (!userData) return;

    const currentProgress = userData.tourProgress || {};
    const updatedProgress = { ...currentProgress, [tourKey]: completed };
    const updatedUser = { ...userData, tourProgress: updatedProgress };

    setUserData(updatedUser);
    localStorage.setItem("userData", JSON.stringify(updatedUser));

    try {
      const kazuo_back = process.env.NEXT_PUBLIC_API_URL;
      await fetch(`${kazuo_back}/users/${userData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.token}`,
        },
        body: JSON.stringify({ tourProgress: updatedProgress }),
      });
    } catch (error) {
      console.error("Error updating tour progress", error);
    }
  };

  const value: AppContextType = {
    isLoggedIn,
    userData,
    login,
    logout,
    setUserData,
    markTourAsSeen,
    updateTourProgress,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("Error de contexto");
  }

  return context;
};

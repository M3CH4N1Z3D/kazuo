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
      if (userData?.igmUrl) {
        localStorage.setItem("igmUrl", userData.igmUrl);
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

  const value: AppContextType = {
    isLoggedIn,
    userData,
    login,
    logout,
    setUserData,
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

"use client";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAppContext();
  const router = useRouter();

  const userData = useLocalStorage<string | null>("userData", null);

  useEffect(() => {
    if (!isLoggedIn && !userData) {
      window.location.href = "/Login";
    }
  }, [isLoggedIn, userData, router]);

  return isLoggedIn ? <>{children}</> : null;
};

export default ProtectedRoutes;

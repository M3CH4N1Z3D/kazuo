"use client";
import { usePathname } from "next/navigation";

const ShowComponents = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return <div>{pathname !== "/login" && pathname !== "/Login" && pathname !== "/GestionInventario" && children}</div>;
};

export default ShowComponents;

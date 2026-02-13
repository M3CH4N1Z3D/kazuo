"use client";
import { usePathname } from "next/navigation";

const ShowComponents = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return (
    <>
      {pathname !== "/login" && pathname !== "/Login" && children}
    </>
  );
};

export default ShowComponents;

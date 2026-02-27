import React from "react";
import { SpotOnSpinner } from "./SpotOnSpinner";

interface LoaderProps {
  message?: string;
  size?: string;
  color?: string;
}

const Loader = ({
  message = "Cargando...",
  size = "8",
  color = "text-blue-500",
}: LoaderProps) => {
  // Map legacy size props to SpotOnSpinner sizes
  // Legacy: "small" (h-4 w-4 = 16px), default/other (h-8 w-8 = 32px)
  // New: "sm" (20px), "md" (48px)
  
  let spinnerSize: "sm" | "md" | "lg" | "xl" = "md";
  
  if (size === "small" || size === "sm") {
    spinnerSize = "sm";
  } else if (size === "large" || size === "lg") {
    spinnerSize = "lg";
  } else {
    // Default fallback
    spinnerSize = "md";
  }

  return (
    <div className="flex items-center justify-center">
      <SpotOnSpinner size={spinnerSize} text={message} />
    </div>
  );
};

export default Loader;

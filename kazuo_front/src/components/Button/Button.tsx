import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium shadow-sm hover:shadow-md hover:border-transparent hover:bg-gradient-to-r hover:from-sky-500 hover:to-green-500 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

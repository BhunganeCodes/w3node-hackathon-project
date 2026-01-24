import React from "react";
import clsx from "clsx";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "green" | "blue" | "gray" | "red" | "yellow";
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  children,
  className,
  ...props
}) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  const variantClasses = clsx({
    "bg-gray-100 text-gray-800": variant === "default",
    "bg-green-100 text-green-800": variant === "green",
    "bg-blue-100 text-blue-800": variant === "blue",
    "bg-gray-200 text-gray-900": variant === "gray",
    "bg-red-100 text-red-800": variant === "red",
    "bg-yellow-100 text-yellow-800": variant === "yellow",
  });

  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </span>
  );
};

"use client";

import * as React from "react";

const buttonVariants = {
  primary: "bg-amber-600 text-white hover:bg-amber-700",
  outline: "border border-amber-300 bg-white text-amber-800 hover:bg-amber-50",
  ghost: "text-amber-600 hover:bg-amber-100",
};

const buttonSizes = {
  sm: "h-8 px-3",
  default: "h-10 px-4 py-2",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "default";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${buttonVariants[variant]} ${buttonSizes[size]} ${className || ""}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };

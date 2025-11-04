import React from "react";
import clsx from "clsx";

export default function Button({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default:
      "bg-[#1D3B2D] text-white hover:bg-[#1D3B2D] focus-visible:bg-[#1D3B2D] focus-visible:ring-[#5C8A70] cursor-pointer hover:bg-green-950",
    outline:
      "border border-gray-200 bg-transparent text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-300",
    ghost:
      "bg-transparent text-gray-800 hover:bg-gray-200  focus-visible:ring-gray-200",
    destructive:
      "bg-red-600 text-white hover:bg-red-700/60 focus-visible:ring-red-500 ",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  const classes = clsx(baseStyles, variants[variant], sizes[size], className);

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

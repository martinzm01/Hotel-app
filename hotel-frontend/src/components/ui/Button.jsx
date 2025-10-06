// src/components/ui/Button.jsx
import React from "react";

export default function Button({ children, onClick, variant = "solid", className = "" }) {
  const base = "px-4 py-2 rounded text-sm font-medium transition-colors";
  const styles =
    variant === "outline"
      ? "border border-blue-600 text-blue-600 hover:bg-blue-50"
      : "bg-blue-600 text-white hover:bg-blue-700";

  return (
    <button onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

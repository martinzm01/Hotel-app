import React from "react";

export default function ComponentCard({ title, children, className = "", desc = "" }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className} `}
    >
      {/* Encabezado de la tarjeta */}
      <div className="px-6 py-5">
        <h3 className="text-2xl font-medium text-gray-800 dark:text-black ">
          {title}
        </h3>
        {desc && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
        )}
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

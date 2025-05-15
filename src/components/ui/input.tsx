import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block mb-2 text-sm font-medium text-gray-900">{label}</label>}
        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full
              px-4
              py-3
              text-base
              border
              rounded-lg
              text-gray-900
              placeholder-gray-500
              bg-white
              transition-colors
              duration-200
              ease-in-out
              focus:outline-none
              focus:ring-2
              focus:ring-gray-900
              focus:border-transparent
              disabled:opacity-50
              disabled:cursor-not-allowed
              ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300"}
              ${icon ? "pr-12" : ""}
              ${className}
            `}
            {...props}
          />
          {icon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              {icon}
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

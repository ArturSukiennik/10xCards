import type { HTMLAttributes, ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Toast Component
interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
  className = "",
  ...props
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-gray-900",
  };

  return createPortal(
    <div
      role="alert"
      className={`
        fixed
        bottom-4
        right-4
        z-50
        flex
        items-center
        px-4
        py-3
        text-white
        rounded-lg
        shadow-lg
        ${colors[type]}
        ${className}
      `}
      {...props}
    >
      {message}
      <button onClick={onClose} className="ml-4 hover:opacity-80" aria-label="Close">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>,
    document.body,
  );
}

// Progress Bar Component
interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  progress: number;
  color?: string;
}

export function ProgressBar({
  progress,
  color = "#FF385C",
  className = "",
  ...props
}: ProgressBarProps) {
  return (
    <div className={`h-1 w-full bg-gray-200 rounded-full overflow-hidden ${className}`} {...props}>
      <div
        className="h-full transition-all duration-300 ease-in-out"
        style={{
          width: `${Math.min(Math.max(progress, 0), 100)}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

// Loading Spinner Component
interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function Spinner({
  size = "md",
  color = "#FF385C",
  className = "",
  ...props
}: SpinnerProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={`inline-block animate-spin ${sizes[size]} ${className}`} {...props}>
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

// Skeleton Loading Component
interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
  ...props
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200";
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const style = {
    width: width,
    height: height || (variant === "text" ? "1em" : undefined),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      {...props}
    />
  );
}

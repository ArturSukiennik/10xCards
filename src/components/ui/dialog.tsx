import type { HTMLAttributes, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function Dialog({ children, isOpen, onClose, className = "", ...props }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className={`
          relative
          w-full
          max-w-lg
          max-h-[90vh]
          overflow-y-auto
          bg-white
          rounded-xl
          shadow-lg
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  onClose?: () => void;
}

export function DialogHeader({ children, onClose, className = "", ...props }: DialogHeaderProps) {
  return (
    <div
      className={`
        flex
        items-start
        justify-between
        p-6
        border-b
        border-gray-200
        ${className}
      `}
      {...props}
    >
      <div className="pr-6">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close dialog"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function DialogContent({ children, className = "", ...props }: DialogContentProps) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function DialogFooter({ children, className = "", ...props }: DialogFooterProps) {
  return (
    <div
      className={`
        flex
        items-center
        justify-end
        gap-3
        p-6
        border-t
        border-gray-200
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

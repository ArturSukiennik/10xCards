import type { HTMLAttributes, ReactNode } from "react";

interface FormProps extends HTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function Form({ children, className = "", onSubmit, ...props }: FormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`} {...props}>
      {children}
    </form>
  );
}

interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function FormGroup({ children, className = "", ...props }: FormGroupProps) {
  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface FormLabelProps extends HTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
}

export function FormLabel({ children, required, className = "", ...props }: FormLabelProps) {
  return (
    <label className={`block text-sm font-medium text-gray-900 ${className}`} {...props}>
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

interface FormHelperProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function FormHelper({ children, className = "", ...props }: FormHelperProps) {
  return (
    <p className={`mt-1 text-sm text-gray-500 ${className}`} {...props}>
      {children}
    </p>
  );
}

interface FormErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function FormError({ children, className = "", ...props }: FormErrorProps) {
  return (
    <p className={`mt-1 text-sm text-red-500 ${className}`} {...props}>
      {children}
    </p>
  );
}

interface FormActionsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function FormActions({ children, className = "", ...props }: FormActionsProps) {
  return (
    <div className={`flex items-center justify-end gap-3 mt-8 ${className}`} {...props}>
      {children}
    </div>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-[#FF385C] text-white hover:bg-[#E31C5F] focus:ring-[#FF385C]",
        secondary: "border-2 border-gray-900 text-gray-900 hover:bg-gray-100 focus:ring-gray-900",
        text: "text-gray-900 hover:underline focus:ring-gray-900 p-0",
      },
      size: {
        sm: "text-sm px-4 py-2",
        md: "text-base px-6 py-3",
        lg: "text-lg px-8 py-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  icon?: ReactNode;
}

export function Button({ children, variant, size, icon, className = "", ...props }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size, className })} {...props}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}

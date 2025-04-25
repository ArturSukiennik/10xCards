import type { ReactNode } from "react";

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

export function H1({ children, className = "" }: TypographyProps) {
  return (
    <h1 className={`text-[32px] font-bold leading-tight text-gray-900 ${className}`}>{children}</h1>
  );
}

export function H2({ children, className = "" }: TypographyProps) {
  return (
    <h2 className={`text-[26px] font-bold leading-tight text-gray-900 ${className}`}>{children}</h2>
  );
}

export function H3({ children, className = "" }: TypographyProps) {
  return (
    <h3 className={`text-[22px] font-medium leading-snug text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

export function Body({ children, className = "" }: TypographyProps) {
  return <p className={`text-base leading-normal text-gray-700 ${className}`}>{children}</p>;
}

export function Caption({ children, className = "" }: TypographyProps) {
  return <span className={`text-sm leading-normal text-gray-500 ${className}`}>{children}</span>;
}

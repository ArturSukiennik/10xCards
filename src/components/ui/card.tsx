import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  image?: string;
  imageAlt?: string;
  hoverable?: boolean;
}

export function Card({
  children,
  image,
  imageAlt = "",
  hoverable = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-white
        rounded-xl
        shadow-sm
        overflow-hidden
        ${hoverable ? "transition-transform duration-200 hover:scale-[1.02] hover:shadow-md" : ""}
        ${className}
      `}
      {...props}
    >
      {image && (
        <div className="relative aspect-[4/3] w-full">
          <img src={image} alt={imageAlt} className="object-cover w-full h-full" />
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ children, className = "", ...props }: CardHeaderProps) {
  return (
    <div className={`space-y-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ children, className = "", ...props }: CardContentProps) {
  return (
    <div className={`pt-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className = "", ...props }: CardFooterProps) {
  return (
    <div className={`flex items-center pt-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

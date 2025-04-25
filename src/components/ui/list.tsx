import type { HTMLAttributes, ReactNode } from "react";

interface ListProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
  divided?: boolean;
}

export function List({ children, divided = false, className = "", ...props }: ListProps) {
  return (
    <ul
      className={`
        space-y-1
        ${divided ? "divide-y divide-gray-200" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </ul>
  );
}

interface ListItemProps extends HTMLAttributes<HTMLLIElement> {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
}

export function ListItem({
  children,
  active = false,
  disabled = false,
  className = "",
  ...props
}: ListItemProps) {
  return (
    <li
      className={`
        relative
        px-4
        py-3
        transition-colors
        duration-200
        ${active ? "bg-gray-100" : "hover:bg-gray-50"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      {...props}
    >
      {children}
    </li>
  );
}

interface ListItemStartProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ListItemStart({ children, className = "", ...props }: ListItemStartProps) {
  return (
    <div className={`flex-shrink-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface ListItemContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ListItemContent({ children, className = "", ...props }: ListItemContentProps) {
  return (
    <div className={`flex-1 min-w-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface ListItemEndProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ListItemEnd({ children, className = "", ...props }: ListItemEndProps) {
  return (
    <div className={`flex-shrink-0 ml-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface ListItemTitleProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ListItemTitle({ children, className = "", ...props }: ListItemTitleProps) {
  return (
    <div className={`text-sm font-medium text-gray-900 truncate ${className}`} {...props}>
      {children}
    </div>
  );
}

interface ListItemDescriptionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ListItemDescription({
  children,
  className = "",
  ...props
}: ListItemDescriptionProps) {
  return (
    <div className={`text-sm text-gray-500 truncate ${className}`} {...props}>
      {children}
    </div>
  );
}

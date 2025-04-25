import type { HTMLAttributes, ReactNode } from "react";
import { useState } from "react";

interface NavigationProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  sticky?: boolean;
}

export function Navigation({ children, sticky = true, className = "", ...props }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className={`
        bg-white
        border-b
        border-gray-200
        ${sticky ? "sticky top-0 z-40" : ""}
        ${className}
      `}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {/* Logo slot */}
              <div className="block">{children}</div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-900"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? "block" : "hidden"} sm:hidden`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">{/* Mobile menu content slot */}</div>
      </div>
    </nav>
  );
}

interface NavigationItemProps extends HTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  href: string;
  active?: boolean;
}

export function NavigationItem({
  children,
  href,
  active = false,
  className = "",
  ...props
}: NavigationItemProps) {
  return (
    <a
      href={href}
      className={`
        block
        px-3
        py-2
        rounded-md
        text-base
        font-medium
        ${
          active
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </a>
  );
}

interface NavigationGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function NavigationGroup({ children, className = "", ...props }: NavigationGroupProps) {
  return (
    <div className={`hidden sm:ml-6 sm:flex sm:space-x-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
